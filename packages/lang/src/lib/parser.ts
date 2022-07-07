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
			{ ALT: () => this.SUBRULE(this.CssStmt) },
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

	/**
	 * FIXME:
	 *
	 * 4 tokens is a lot of lookahead, and this still isn't enough to fully
	 * disambiguate. E.g., these statements would need LA(6):
	 *
	 * ```scss
	 * .foo {
	 *   // Nested selector:
	 *   div:hover div div div {}
	 *   // Property declaration:
	 *   background: transparent center center no-repeat
	 * }
	 * ```
	 * And that's probably not the only example. Is this why the reference
	 * implementation parses the source text directly instead of scanning tokens?
	 */
	BlockLevelStmt = this.RULE("BlockLevelStmt", () => {
		this.OR([
			{
				GATE: () => (
					this.LA(4).tokenType === Token.SemiColon
					|| this.LA(4).tokenType === Token.RBrace
				),
				ALT: () => this.SUBRULE(this.PropertyDecl)
			},
			{ ALT: () => this.SUBRULE(this.UniversalStmt) },
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
			{ ALT: () => this.SUBRULE(this.ForStmt) },
			{ ALT: () => this.SUBRULE(this.WhileStmt) },
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

	ForStmt = this.RULE("ForStmt", () => {
		this.CONSUME(Token.AtFor);
		this.CONSUME(Token.SassVar);
		this.CONSUME(Token.From);
		this.SUBRULE(this.Expression);
		this.OR([
			{ ALT: () => this.CONSUME(Token.Through) },
			{ ALT: () => this.CONSUME(Token.To) },
		]),
		this.SUBRULE1(this.Expression);
		this.SUBRULE(this.Block);
	});

	WhileStmt = this.RULE("WhileStmt", () => {
		this.CONSUME(Token.AtWhile);
		this.SUBRULE(this.Expression);
		this.SUBRULE(this.Block);
	});

	SassDirectiveStmt = this.RULE("SassDirectiveStmt", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Token.AtError) },
			{ ALT: () => this.CONSUME(Token.AtWarn) },
			{ ALT: () => this.CONSUME(Token.AtDebug) },
		]);
		this.SUBRULE(this.StringLiteral);
		this.SUBRULE(this.Terminator);
	});

	CssStmt = this.RULE("CssStmt", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.StyleRuleStmt) },
//			{ ALT: () => this.SUBRULE(this.CssAtRuleStmt) },
//			{ ALT: () => this.SUBRULE(this.IncludeStmt) },
//			{ ALT: () => this.SUBRULE(this.AtRootStmt) },
		])
	});

	StyleRuleStmt = this.RULE("StyleRuleStmt", () => {
		this.SUBRULE(this.SelectorList);
		this.SUBRULE(this.Block);
	});

	SelectorList = this.RULE("SelectorList", () => {
		this.AT_LEAST_ONE_SEP({
			SEP: Token.Comma,
			DEF: () => {
				this.AT_LEAST_ONE(() => {
					this.OR([
						{ ALT: () => this.SUBRULE(this.Selector) },
						{ ALT: () => this.SUBRULE(this.Combinator) },
						{ ALT: () => this.CONSUME(Token.Ampersand) },
					]);
				});
			},
		});
	});

	Selector = this.RULE("Selector", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Token.Star) },
			{ ALT: () => this.CONSUME(Token.Ident) },
			{ ALT: () => {
				this.CONSUME(Token.ColonColon);
				this.CONSUME1(Token.Ident);
				this.OPTION(() => {
					this.SUBRULE(this.SelectorArguments);
				});
			}},
			{ ALT: () => {
				this.CONSUME(Token.Colon);
				this.CONSUME2(Token.Ident);
				this.OPTION1(() => {
					this.SUBRULE1(this.SelectorArguments);
				});
			}},
			{ ALT: () => {
				this.CONSUME(Token.Dot);
				this.CONSUME3(Token.Ident);
			}},
			{ ALT: () => {
				this.CONSUME(Token.Hash);
				this.CONSUME4(Token.Ident);
			}},
			{ ALT: () => this.SUBRULE(this.AttributeSelector) },
		]);
	});

	Combinator = this.RULE("Combinator", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Token.Greater) },
			{ ALT: () => this.CONSUME(Token.Plus) },
			{ ALT: () => this.CONSUME(Token.Tilde) },
			{ ALT: () => this.CONSUME(Token.BarBar) },
		]);
	});

	AttributeSelector = this.RULE("AttributeSelector", () => {
		this.CONSUME(Token.LBracket);
		this.CONSUME(Token.Ident);
		this.OPTION(() => {
			this.OR([
				{ ALT: () => this.CONSUME(Token.StarEqual) },
				{ ALT: () => this.CONSUME(Token.CaretEqual) },
				{ ALT: () => this.CONSUME(Token.BarEqual) },
				{ ALT: () => this.CONSUME(Token.TildeEqual) },
				{ ALT: () => this.CONSUME(Token.DollarEqual) },
				{ ALT: () => this.CONSUME(Token.Equal) },
			]);
			this.SUBRULE(this.Expression);
		});
		this.CONSUME(Token.RBracket);
	});

	SelectorArguments = this.RULE("SelectorArguments", () => {
		this.CONSUME(Token.LParen);
		this.OR([
			{ ALT: () => this.SUBRULE(this.Expression) },
			{ ALT: () => this.SUBRULE(this.SelectorList) },
		]);
		this.CONSUME(Token.RParen);
	});

	PropertyDecl = this.RULE("PropertyDecl", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Token.Ident) },
			{ ALT: () => this.CONSUME(Token.CustomProperty) },
		]);
		this.CONSUME(Token.Colon);
		this.OR1([
			{ ALT: () => this.SUBRULE(this.Block) },
			{ ALT: () => {
				this.OR2([
					{ ALT: () => this.SUBRULE(this.Expression) },
					{ ALT: () => this.CONSUME1(Token.Ident) },
				]);
				this.SUBRULE(this.Terminator);
			}},
		]);
	});

	ModuleLoadStmt = this.RULE("ModuleLoadStmt", () => {
		this.CONSUME(Token.AtUse);
		this.SUBRULE(this.StringLiteral);
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
		this.SUBRULE(this.StringLiteral);
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
			{ ALT: () => this.SUBRULE(this.Literal) },
			// { ALT: () => this.CONSUME(Token.Ident) },
		]);
	});

	Literal = this.RULE("Literal", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.StringLiteral) },
			{ ALT: () => this.CONSUME(Token.BoolLiteral) },
			{ ALT: () => this.CONSUME(Token.NullLiteral) },
			{ ALT: () => this.CONSUME(Token.NumLiteral) },
			{ ALT: () => this.CONSUME(Token.ColorLiteral) },
		])
	});

	StringLiteral = this.RULE("StringLiteral", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.SQuotedStringLiteral) },
			{ ALT: () => this.SUBRULE(this.DQuotedStringLiteral) },
		]);
	});

	SQuotedStringLiteral = this.RULE("SQuotedStringLiteral", () => {
		this.quotedStringExpr(Token.SQuote);
	});

	DQuotedStringLiteral = this.RULE("DQuotedStringLiteral", () => {
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
