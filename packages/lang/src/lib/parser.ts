/* eslint-disable @typescript-eslint/no-this-alias */
import { Fn, KeysWhere } from "@sassy/util";
import { CstNode, CstParser as ChevCstParser, TokenType } from "chevrotain";

import { Lexer, Token, TOKEN_VOCAB } from "./lexer";

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
				{ ALT: () => $.SUBRULE($.FlowControlStmt) },
				{ ALT: () => $.SUBRULE($.SassDirectiveStmt) },
			]);
		});

		$.RULE("TopLevelStmt", () => {
			$.OR([
				{ ALT: () => $.SUBRULE($.ModuleLoadStmt) },
				{ ALT: () => $.SUBRULE($.ImportStmt) },
				{ ALT: () => $.SUBRULE($.MixinDefStmt) },
				{ ALT: () => $.SUBRULE($.FunctionDefStmt) },
			]);
		});

		$.RULE("BlockLevelStmt", () => {
			$.OR([
				{ ALT: () => $.SUBRULE($.UniversalStmt) },
//				{ ALT: () => $.SUBRULE($.CssStmt) },
				{ ALT: () => $.SUBRULE($.ReturnStmt) },
			]);
		});

		$.RULE("VarDeclStmt", () => {
			$.CONSUME(Token.SassVar);
			$.CONSUME(Token.Colon);
			$.SUBRULE($.Expression);
			$.CONSUME(Token.SemiColon);
		});

		$.RULE("FlowControlStmt", () => {
			$.OR([
				{ ALT: () => $.SUBRULE($.IfStmt) },
				{ ALT: () => $.SUBRULE($.EachStmt) },
//				{ ALT: () => $.SUBRULE($.ForStmt) },
//				{ ALT: () => $.SUBRULE($.WhileStmt) },
			]);
		});

		$.RULE("IfStmt", () => {
			$.CONSUME(Token.AtIf);
			$.SUBRULE($.Expression);
			$.SUBRULE($.Block);
			$.MANY(() => {
				$.SUBRULE($.ElseClause);
			});
		});

		$.RULE("ElseClause", () => {
			$.CONSUME(Token.AtElse);
			$.OPTION(() => {
				$.CONSUME(Token.If);
				$.SUBRULE($.Expression);
			});
			$.SUBRULE($.Block);
		});

		$.RULE("EachStmt", () => {
			$.CONSUME(Token.AtEach);
			$.AT_LEAST_ONE_SEP({
				SEP: Token.Comma,
				DEF: () => {
					$.CONSUME(Token.SassVar);
				},
			});
			$.CONSUME(Token.In);
			$.SUBRULE($.Expression);
			$.SUBRULE($.Block);
		});

		$.RULE("SassDirectiveStmt", () => {
			$.OR([
				{ ALT: () => $.CONSUME(Token.AtError) },
				{ ALT: () => $.CONSUME(Token.AtWarn) },
				{ ALT: () => $.CONSUME(Token.AtDebug) },
			]);
			$.SUBRULE($.StringExpr);
			$.CONSUME(Token.SemiColon);
		});

		$.RULE("ModuleLoadStmt", () => {
			$.CONSUME(Token.AtUse);
			$.SUBRULE($.StringExpr);
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
			$.SUBRULE($.Block);
		});

		$.RULE("FunctionDefStmt", () => {
			$.CONSUME(Token.AtFunction);
			$.CONSUME(Token.Ident);
			$.SUBRULE($.Parameters);
			$.SUBRULE($.Block);
		});

		$.RULE("ReturnStmt", () => {
			$.CONSUME(Token.AtReturn);
			$.SUBRULE($.Expression);
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
					$.OR([
						{ ALT: () => $.CONSUME1(Token.Comma) },
						{ ALT: () => $.CONSUME(Token.Ellipsis) },
					]);
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

		$.RULE("Block", () => {
			$.CONSUME(Token.LBrace);
			$.OPTION(() => {
				$.SUBRULE($.BlockLevelStmt);
				$.MANY(() => {
					// FIXME: This isn't going to work...
					//   FlowControlStmt < UniversalStmt < BlockLevelStmt
					//   but FlowControlStmt doesn't terminate with a semicolon
					$.CONSUME(Token.SemiColon);
					$.SUBRULE1($.BlockLevelStmt);
				});
				$.OPTION1(() => {
					$.CONSUME1(Token.SemiColon);
				});
			});
			$.CONSUME(Token.RBrace);
		});

		$.RULE("Expression", () => {
			$.OR([
				{ ALT: () => $.CONSUME(Token.SassVar) },
				{ ALT: () => $.SUBRULE($.StringExpr) },
			]);
		});

		$.RULE("StringExpr", () => {
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

		this.performSelfAnalysis();
	}

	declare SourceFile: CstMethod;

	declare UniversalStmt: CstMethod;
	declare TopLevelStmt: CstMethod;
	declare BlockLevelStmt: CstMethod;
	declare VarDeclStmt: CstMethod;
	declare FlowControlStmt: CstMethod;
	declare IfStmt: CstMethod;
	declare ElseClause: CstMethod;
	declare EachStmt: CstMethod;
	declare SassDirectiveStmt: CstMethod;
	declare ModuleLoadStmt: CstMethod;
	declare ImportStmt: CstMethod;
	declare MixinDefStmt: CstMethod;
	declare FunctionDefStmt: CstMethod;
	declare ReturnStmt: CstMethod;

	declare Expression: CstMethod;

	declare StringExpr: CstMethod;
	declare DQuotedStringExpr: CstMethod;
	declare SQuotedStringExpr: CstMethod;

	declare Parameters: CstMethod;
	declare Parameter: CstMethod;
	declare Block: CstMethod;

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
