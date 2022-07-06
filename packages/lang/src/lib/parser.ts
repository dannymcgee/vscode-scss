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

		this.performSelfAnalysis();
	}

	SourceFile = this.RULE("SourceFile", () => {
		this.MANY(() => {
			this.OR([
				{ ALT: () => this.SUBRULE(this.UniversalStmt) },
				{ ALT: () => this.SUBRULE(this.TopLevelStmt) },
			]);
		});
	});

	UniversalStmt = this.RULE("UniversalStmt", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.VarDeclStmt) },
			{ ALT: () => this.SUBRULE(this.FlowControlStmt) },
			{ ALT: () => this.SUBRULE(this.SassDirectiveStmt) },
		]);
	});

	TopLevelStmt = this.RULE("TopLevelStmt", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.ModuleLoadStmt) },
			{ ALT: () => this.SUBRULE(this.ImportStmt) },
			{ ALT: () => this.SUBRULE(this.MixinDefStmt) },
			{ ALT: () => this.SUBRULE(this.FunctionDefStmt) },
		]);
	});

	BlockLevelStmt = this.RULE("BlockLevelStmt", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.UniversalStmt) },
//			{ ALT: () => this.SUBRULE(this.CssStmt) },
			{ ALT: () => this.SUBRULE(this.ReturnStmt) },
		]);
	});

	VarDeclStmt = this.RULE("VarDeclStmt", () => {
		this.CONSUME(Token.SassVar);
		this.CONSUME(Token.Colon);
		this.SUBRULE(this.Expression);
		this.SUBRULE(this.Terminator);
	});

	FlowControlStmt = this.RULE("FlowControlStmt", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.IfStmt) },
			{ ALT: () => this.SUBRULE(this.EachStmt) },
//			{ ALT: () => this.SUBRULE(this.ForStmt) },
//			{ ALT: () => this.SUBRULE(this.WhileStmt) },
		]);
	});

	IfStmt = this.RULE("IfStmt", () => {
		this.CONSUME(Token.AtIf);
		this.SUBRULE(this.Expression);
		this.SUBRULE(this.Block);
		this.MANY(() => {
			this.SUBRULE(this.ElseClause);
		});
	});

	ElseClause = this.RULE("ElseClause", () => {
		this.CONSUME(Token.AtElse);
		this.OPTION(() => {
			this.CONSUME(Token.If);
			this.SUBRULE(this.Expression);
		});
		this.SUBRULE(this.Block);
	});

	EachStmt = this.RULE("EachStmt", () => {
		this.CONSUME(Token.AtEach);
		this.AT_LEAST_ONE_SEP({
			SEP: Token.Comma,
			DEF: () => {
				this.CONSUME(Token.SassVar);
			},
		});
		this.CONSUME(Token.In);
		this.SUBRULE(this.Expression);
		this.SUBRULE(this.Block);
	});

	SassDirectiveStmt = this.RULE("SassDirectiveStmt", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Token.AtError) },
			{ ALT: () => this.CONSUME(Token.AtWarn) },
			{ ALT: () => this.CONSUME(Token.AtDebug) },
		]);
		this.SUBRULE(this.StringExpr);
		this.SUBRULE(this.Terminator);
	});

	ModuleLoadStmt = this.RULE("ModuleLoadStmt", () => {
		this.CONSUME(Token.AtUse);
		this.SUBRULE(this.StringExpr);
		this.OPTION(() => {
			this.CONSUME(Token.As);
			this.OR([
				{ ALT: () => this.CONSUME(Token.Ident) },
				{ ALT: () => this.CONSUME(Token.Star) },
			]);
		});
		this.CONSUME(Token.SemiColon);
	});

	ImportStmt = this.RULE("ImportStmt", () => {
		this.CONSUME(Token.AtImport);
		this.SUBRULE(this.StringExpr);
		this.SUBRULE(this.Terminator);
	});

	MixinDefStmt = this.RULE("MixinDefStmt", () => {
		this.CONSUME(Token.AtMixin);
		this.CONSUME(Token.Ident);
		this.OPTION(() => {
			this.SUBRULE(this.Parameters);
		});
		this.SUBRULE(this.Block);
	});

	FunctionDefStmt = this.RULE("FunctionDefStmt", () => {
		this.CONSUME(Token.AtFunction);
		this.CONSUME(Token.Ident);
		this.SUBRULE(this.Parameters);
		this.SUBRULE(this.Block);
	});

	ReturnStmt = this.RULE("ReturnStmt", () => {
		this.CONSUME(Token.AtReturn);
		this.SUBRULE(this.Expression);
		this.SUBRULE(this.Terminator);
	});

	Parameters = this.RULE("Parameters", () => {
		this.CONSUME(Token.LParen);
		this.OPTION(() => {
			this.SUBRULE(this.Parameter);
			this.MANY(() => {
				this.CONSUME(Token.Comma);
				this.SUBRULE1(this.Parameter);
			});
			this.OPTION1(() => {
				this.OR([
					{ ALT: () => this.CONSUME1(Token.Comma) },
					{ ALT: () => this.CONSUME(Token.Ellipsis) },
				]);
			});
		});
		this.CONSUME(Token.RParen);
	});

	Parameter = this.RULE("Parameter", () => {
		this.CONSUME(Token.SassVar);
		this.OPTION(() => {
			this.CONSUME(Token.Colon);
			this.SUBRULE(this.Expression);
		});
	});

	Block = this.RULE("Block", () => {
		this.CONSUME(Token.LBrace);
		this.MANY(() => {
			this.SUBRULE(this.BlockLevelStmt);
		});
		this.CONSUME(Token.RBrace);
	});

	Expression = this.RULE("Expression", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Token.SassVar) },
			{ ALT: () => this.SUBRULE(this.StringExpr) },
		]);
	});

	StringExpr = this.RULE("StringExpr", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.SQuotedStringExpr) },
			{ ALT: () => this.SUBRULE(this.DQuotedStringExpr) },
		]);
	});

	SQuotedStringExpr = this.RULE("SQuotedStringExpr", () => {
		this.quotedStringExpr(Token.SQuote);
	});

	DQuotedStringExpr = this.RULE("DQuotedStringExpr", () => {
		this.quotedStringExpr(Token.DQuote);
	});

	Terminator = this.RULE("Terminator", () => {
		this.OR([{
			GATE: () => this.LA(1).tokenType === Token.RBrace,
			ALT: () => this.OPTION(() => this.CONSUME(Token.SemiColon)),
		}, {
			ALT: () => this.CONSUME1(Token.SemiColon),
		}]);
	});

	private quotedStringExpr(quote: TokenType) {
		this.CONSUME(quote);
		this.MANY(() => {
			this.NOT(quote);
		});
		this.CONSUME1(quote);
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
