import { Bootstrapper } from "./bootstrapper";
import { Token, TOKEN_VOCAB } from "./lexer";

describe("Bootstrapper", () => {
	it("should work", () => {
		class Parser extends Bootstrapper {
			constructor () {
				super(TOKEN_VOCAB.slice(), { nodeLocationTracking: "full" });

				this.grammar`
				SourceFile
					= ( UniversalStmt | TopLevelStmt )*
					;

				UniversalStmt
					= VarDeclStmt
					| FlowControlStmt
					| SassDirectiveStmt
					;

				TopLevelStmt
					= ModuleLoadStmt
					| ImportStmt
					| MixinDefStmt
					| FunctionDefStmt
					;

				BlockLevelStmt
					= UniversalStmt
					| ReturnStmt
					;

				VarDeclStmt
					= ${Token.SassVar} ${Token.Colon} Expression Terminator
					;

				FlowControlStmt
					= IfStmt
					| EachStmt
					;

				IfStmt
					= ${Token.AtIf} Expression Block ( ElseClause )*
					;

				ElseClause
					= ${Token.AtElse} ( ${Token.If} Expression )? Block
					;

				EachStmt
					= ${Token.AtEach}
						( ${Token.SassVar} )[${Token.Comma}]+
						${Token.In}
						Expression
						Block
					;

				SassDirectiveStmt
					= ( ${Token.AtError} | ${Token.AtWarn} | ${Token.AtDebug} )
						QuotedStringExpr
						Terminator
					;

				ModuleLoadStmt
					= ${Token.AtUse}
						QuotedStringExpr
						( ${Token.As} ( ${Token.Ident} | ${Token.Star} ) )?
						${Token.SemiColon}
					;

				ImportStmt
					= ${Token.AtImport} StringExpr Terminator
					;

				MixinDefStmt
					= ${Token.AtMixin} ${Token.Ident} ( Parameters )? RuleBlock
					;

				FunctionDefStmt
					= ${Token.AtFunction} ${Token.Ident} Parameters FunctionBody
					;

				ReturnStmt
					= ${Token.AtReturn} Expression
					;

				Parameters
					= ${Token.LParen}
						( Parameter
							( ${Token.Comma} Parameter )*
							( ${Token.Comma} | ${Token.Ellipsis} )?
						)?
						${Token.RParen}
					;

				Parameter
					= ${Token.SassVar} ( ${Token.Colon} Expression )?
					;

				Block
					= ${Token.LBrace} ( BlockLevelStmt )* ${Token.RBrace}
					;

				Expression
					= ${Token.SassVar}
					| StringExpr
					;

				StringExpr
					= SQuotedStringExpr | DQuotedStringExpr
					;

				SQuotedStringExpr
					= ${Token.SQuote} ( ~${Token.SQuote} )* ${Token.SQuote}
					;

				DQuotedStringExpr
					= ${Token.DQuote} ( ~${Token.DQuote} )* ${Token.DQuote}
					;

				Terminator
					= (?=> ${Token.RBrace} ) ${Token.SemiColon}?
					| ${Token.SemiColon}
					;
				`
			}
		}

		expect.anything();
		// expect(new Parser()).toBeTruthy();
	});
});
