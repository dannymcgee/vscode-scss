/* eslint-disable @typescript-eslint/no-this-alias */
import { Fn, KeysWhere } from "@sassy/util";
import { CstNode, CstParser as ChevCstParser, TokenType } from "chevrotain";

import { isQuote, Lexer, Token, TOKEN_VOCAB } from "./lexer";

type CstMethod<Params extends unknown[] = []> =
	Fn<Params, CstNode>;

class BaseCstParser extends ChevCstParser {
	protected NOT(selector: TokenType | TokenType[]) {
		const $ = this;

		const pred: Fn<[TokenType], boolean> = Array.isArray(selector)
			? type => !selector.includes(type)
			: type => type !== selector;

		return $.OR(TOKEN_VOCAB
			.filter(pred)
			.map(type => ({
				ALT: () => $.CONSUME(type),
			})),
		);
	}
}

class CstParser extends BaseCstParser {
	constructor () {
		super(TOKEN_VOCAB.slice(), { nodeLocationTracking: "full" });
		const $ = this;

		$.RULE("SourceFile", () => {
			$.MANY(() => {
				$.OR([
					{ ALT: () => $.SUBRULE($.UniversalStmt) },
					{ ALT: () => $.SUBRULE($.TopLevelStmt) },
				]);
			});
		});

		$.RULE("UniversalStmt", () => {
			$.OR([
				{ ALT: () => $.SUBRULE($.VarDeclStmt) },
//				{ ALT: () => $.SUBRULE($.FlowControlStmt) },
				{ ALT: () => $.SUBRULE($.SassDirectiveStmt) },
			]);
		});

		$.RULE("TopLevelStmt", () => {
			$.OR([
				{ ALT: () => $.SUBRULE($.ModuleLoadStmt) },
				{ ALT: () => $.SUBRULE($.ImportStmt) },
				{ ALT: () => $.SUBRULE($.MixinDefStmt) },
//				{ ALT: () => $.SUBRULE($.FunctionDefStmt) },
			]);
		});

		$.RULE("VarDeclStmt", () => {
			$.CONSUME(Token.SassVar);
			$.CONSUME(Token.Colon);
			$.SUBRULE($.Expression);
			$.CONSUME(Token.SemiColon);
		});

		$.RULE("SassDirectiveStmt", () => {
			$.OR([
				{ ALT: () => $.CONSUME(Token.AtError) },
				{ ALT: () => $.CONSUME(Token.AtWarn) },
				{ ALT: () => $.CONSUME(Token.AtDebug) },
			]);
			$.SUBRULE($.QuotedStringExpr);
			$.CONSUME(Token.SemiColon);
		});

		$.RULE("ModuleLoadStmt", () => {
			$.CONSUME(Token.AtUse);
			$.SUBRULE($.QuotedStringExpr);
			$.OPTION(() => {
				$.CONSUME(Token.As);
				$.OR([
					{ ALT: () => $.CONSUME(Token.Ident) },
					{ ALT: () => $.CONSUME(Token.Star) },
				]);
			});
			$.CONSUME(Token.SemiColon);
		});

		$.RULE("ImportStmt", () => {
			$.CONSUME(Token.AtImport);
			$.SUBRULE($.StringExpr);
			$.CONSUME(Token.SemiColon);
		});

		$.RULE("MixinDefStmt", () => {
			$.CONSUME(Token.AtMixin);
			$.CONSUME(Token.Ident);
			$.OPTION(() => {
				$.SUBRULE($.Parameters);
			});
			$.SUBRULE($.RuleBlock);
		});

		$.RULE("Parameters", () => {
			$.CONSUME(Token.LParen);
			$.OPTION(() => {
				$.SUBRULE($.Parameter);
				$.MANY(() => {
					$.CONSUME(Token.Comma);
					$.SUBRULE1($.Parameter);
				});
				$.OPTION1(() => {
					$.CONSUME1(Token.Comma);
				});
			});
			$.CONSUME(Token.RParen);
		});

		$.RULE("Parameter", () => {
			$.CONSUME(Token.SassVar);
			$.OPTION(() => {
				$.CONSUME(Token.Colon);
				$.SUBRULE($.Expression);
			});
		});

		$.RULE("RuleBlock", () => {
			$.CONSUME(Token.LBrace);
			// TODO
			$.CONSUME(Token.RBrace);
		});

		$.RULE("Expression", () => {
			$.OR([
				{ ALT: () => $.SUBRULE($.StringExpr) },
			]);
		});

		$.RULE("StringExpr", () => {
			$.OR([{
				ALT: () => $.SUBRULE($.QuotedStringExpr)
			}, {
				GATE: () => !isQuote($.LA(1).tokenType),
				ALT: () => $.SUBRULE($.UnquotedStringExpr)
			}]);
		});

		$.RULE("QuotedStringExpr", () => {
			$.OR([{
				GATE: () => $.LA(1).tokenType === Token.SQuote,
				ALT: () => $.SUBRULE($.SQuotedStringExpr),
			}, {
				GATE: () => $.LA(1).tokenType === Token.DQuote,
				ALT: () => $.SUBRULE($.DQuotedStringExpr),
			}]);
		});

		$.RULE("SQuotedStringExpr", () => {
			this.quotedStringExpr(Token.SQuote);
		});

		$.RULE("DQuotedStringExpr", () => {
			this.quotedStringExpr(Token.DQuote);
		});

		$.RULE("UnquotedStringExpr", () => {
			$.AT_LEAST_ONE(() => {
				$.NOT(Token.SemiColon);
			});
		});

		this.performSelfAnalysis();
	}

	declare SourceFile: CstMethod;

	declare UniversalStmt: CstMethod;
	declare TopLevelStmt: CstMethod;
	declare VarDeclStmt: CstMethod;
	declare SassDirectiveStmt: CstMethod;
	declare ModuleLoadStmt: CstMethod;
	declare ImportStmt: CstMethod;
	declare MixinDefStmt: CstMethod;

	declare Expression: CstMethod;

	declare StringExpr: CstMethod;
	declare QuotedStringExpr: CstMethod;
	declare DQuotedStringExpr: CstMethod;
	declare SQuotedStringExpr: CstMethod;
	declare UnquotedStringExpr: CstMethod;

	declare Parameters: CstMethod;
	declare Parameter: CstMethod;
	declare RuleBlock: CstMethod;

	private quotedStringExpr(quote: TokenType) {
		const $ = this;

		$.CONSUME(quote);
		$.MANY(() => {
			$.NOT(quote);
		});
		$.CONSUME1(quote);
	}
}

export class Parser {
	private static instance = new CstParser();

	parse(input: string, entry?: Exclude<KeysWhere<CstParser, CstMethod>, keyof BaseCstParser>) {
		const { tokens } = Lexer.tokenize(input);
		Parser.instance.input = tokens;

		const result = entry
			? Parser.instance[entry]()
			: Parser.instance.SourceFile();

		if (Parser.instance.errors.length) {
			const errors = Parser.instance.errors.slice();
			Parser.instance.errors = [];

			return errors;
		}
		return result;
	}
}