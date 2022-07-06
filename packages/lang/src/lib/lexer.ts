import { Lexer as ChevLexer, TokenType } from "chevrotain";

import { re, token } from "./util";
import { ALL_COLORS } from "./colors";

/** Pattern for identifiers */
const IDENT = /(?:[_a-zA-Z0-9]|\p{L})(?:[-_a-zA-Z0-9]|\p{L})*/u;
/** Lookahead word boundary */
const WB = /(?=[^-_a-zA-Z0-9])/;

export class Token {
	@token(/\s+/, { group: ChevLexer.SKIPPED })
	static Whitespace: TokenType;

	@token(/\/\/.*/)
	static LineComment: TokenType;

	@token(/\/\*.*?\*\//)
	static BlockComment: TokenType;

	@token(/\/\/\/.*/)
	static SassDoc: TokenType;

	@token(IDENT)
	static Ident: TokenType;

	@token(re`/(else|from|through|to)${WB}/`, { longer_alt: Token.Ident })
	static Keyword: TokenType;

	@token(re`/(as)${WB}/`, { longer_alt: Token.Ident })
	static As: TokenType;

	@token(re`/(and)${WB}/`, { longer_alt: Token.Ident })
	static And: TokenType;

	@token(re`/(or)${WB}/`, { longer_alt: Token.Ident })
	static Or: TokenType;

	@token(re`/(true|false)${WB}/`, { longer_alt: Token.Ident })
	static BoolLiteral: TokenType;

	@token(re`/(null)${WB}/`, { longer_alt: Token.Ident })
	static NullLiteral: TokenType;

	@token(re.merge(
		/#[a-fA-F0-9]{8}/,
		/#[a-fA-F0-9]{6}/,
		/#[a-fA-F0-9]{3,4}/,
		re`/\b(?:${ALL_COLORS.join("|")})\b/`,
	))
	static ColorLiteral: TokenType;

	@token(re`/@(${IDENT})/`)
	static AtWord: TokenType;

	@token(/@use/, { longer_alt: Token.AtWord })
	static AtUse: TokenType;

	@token(/@forward/, { longer_alt: Token.AtWord })
	static AtForward: TokenType;

	@token(/@import/, { longer_alt: Token.AtWord })
	static AtImport: TokenType;

	@token(/@mixin/, { longer_alt: Token.AtWord })
	static AtMixin: TokenType;

	@token(/@include/, { longer_alt: Token.AtWord })
	static AtInclude: TokenType;

	@token(/@function/, { longer_alt: Token.AtWord })
	static AtFunction: TokenType;

	@token(/@return/, { longer_alt: Token.AtWord })
	static AtReturn: TokenType;

	@token(/@extend/, { longer_alt: Token.AtWord })
	static AtExtend: TokenType;

	@token(/@error/, { longer_alt: Token.AtWord })
	static AtError: TokenType;

	@token(/@warn/, { longer_alt: Token.AtWord })
	static AtWarn: TokenType;

	@token(/@debug/, { longer_alt: Token.AtWord })
	static AtDebug: TokenType;

	@token(/@at-root/, { longer_alt: Token.AtWord })
	static AtAtRoot: TokenType;

	@token(/@if/, { longer_alt: Token.AtWord })
	static AtIf: TokenType;

	@token(/@else/, { longer_alt: Token.AtWord })
	static AtElse: TokenType;

	@token(re`/(if)${WB}/`, { longer_alt: Token.Ident })
	static If: TokenType;

	@token(/@each/, { longer_alt: Token.AtWord })
	static AtEach: TokenType;

	@token(re`/(in)${WB}/`, { longer_alt: Token.Ident })
	static In: TokenType;

	@token(/@for/, { longer_alt: Token.AtWord })
	static AtFor: TokenType;

	@token(/@while/, { longer_alt: Token.AtWord })
	static AtWhile: TokenType;

	@token(re`/\$(${IDENT})/`)
	static SassVar: TokenType;

	@token(re`/--(${IDENT})/`)
	static CustomProperty: TokenType;

	@token(/#{/)
	static HashBrace: TokenType;

	@token(/{/)
	static LBrace: TokenType;

	@token(/}/)
	static RBrace: TokenType;

	@token(/[[\]]/)
	static Bracket: TokenType;

	@token(/\(/)
	static LParen: TokenType;

	@token(/\)/)
	static RParen: TokenType;

	@token(/"/)
	static DQuote: TokenType;

	@token(/'/)
	static SQuote: TokenType;

	@token(/::/)
	static ColonColon: TokenType;

	@token(/:/)
	static Colon: TokenType;

	@token(/,/)
	static Comma: TokenType;

	@token(/;/)
	static SemiColon: TokenType;

	@token(re.merge(
		/-?[0-9]+[.0-9]*[%a-z]*/,
		/-?\.?[0-9]+[%a-z]*/,
	))
	static NumLiteral: TokenType;

	@token(/\.\.\./)
	static Ellipsis: TokenType;

	@token(/\./)
	static Dot: TokenType;

	@token(/#/)
	static Hash: TokenType;

	@token(/\+/)
	static Plus: TokenType;

	@token(/-/)
	static Minus: TokenType;

	@token(/==/)
	static EqualEqual: TokenType;

	@token(/=/)
	static Equal: TokenType;

	@token(/\*=/)
	static StarEqual: TokenType;

	@token(/\*/)
	static Star: TokenType;

	@token(/\//)
	static Slash: TokenType;

	@token(/!=/)
	static BangEqual: TokenType;

	@token(/!/)
	static Bang: TokenType;

	@token(/\^=/)
	static CaretEqual: TokenType;

	@token(/\^/)
	static Caret: TokenType;

	@token(/\|=/)
	static BarEqual: TokenType;

	@token(/\|/)
	static Bar: TokenType;

	@token(/~=/)
	static TildeEqual: TokenType;

	@token(/~/)
	static Tilde: TokenType;

	@token(/\$=/)
	static DollarEqual: TokenType;

	@token(/\$/)
	static Dollar: TokenType;

	@token(/<=/)
	static LessEqual: TokenType;

	@token(/</)
	static Less: TokenType;

	@token(/>=/)
	static GreaterEqual: TokenType;

	@token(/>/)
	static Greater: TokenType;

	@token(/&/)
	static Ampersand: TokenType;
}

export const TOKEN_VOCAB = [
	Token.Whitespace,
	// Comments
	Token.SassDoc,
	Token.LineComment,
	Token.BlockComment,
	// Literals
	Token.BoolLiteral,
	Token.NullLiteral,
	Token.ColorLiteral,
	Token.NumLiteral,
	// Ident and family
	Token.Keyword,
	Token.As,
	Token.And,
	Token.Or,
	Token.SassVar,
	Token.CustomProperty,
	// At-Rules
	Token.AtUse,
	Token.AtForward,
	Token.AtImport,
	Token.AtMixin,
	Token.AtInclude,
	Token.AtFunction,
	Token.AtReturn,
	Token.AtExtend,
	Token.AtError,
	Token.AtWarn,
	Token.AtDebug,
	Token.AtAtRoot,
	Token.AtIf,
	Token.AtElse,
	Token.If,
	Token.AtEach,
	Token.In,
	Token.AtFor,
	Token.AtWhile,
	Token.AtWord,
	// Any other identifier
	Token.Ident,
	// Delimiters
	Token.DQuote,
	Token.SQuote,
	Token.HashBrace,
	Token.LBrace,
	Token.RBrace,
	Token.Bracket,
	Token.LParen,
	Token.RParen,
	// Punctuation
	Token.Ellipsis,
	Token.Dot,
	Token.Hash,
	Token.ColonColon,
	Token.Colon,
	Token.Comma,
	Token.SemiColon,
	// Operators
	Token.Plus,
	Token.Minus,
	Token.EqualEqual,
	Token.Equal,
	Token.StarEqual,
	Token.Star,
	Token.Slash,
	Token.BangEqual,
	Token.Bang,
	Token.CaretEqual,
	Token.Caret,
	Token.BarEqual,
	Token.Bar,
	Token.TildeEqual,
	Token.Tilde,
	Token.DollarEqual,
	Token.Dollar,
	Token.LessEqual,
	Token.Less,
	Token.GreaterEqual,
	Token.Greater,
	Token.Ampersand,
] as const;

export const Lexer = new ChevLexer(TOKEN_VOCAB.slice());
