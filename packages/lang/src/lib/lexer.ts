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

	// TODO: These are only keywords in certain contexts
	@token(re`/(if|else|from|through|to|in|as|and|or)${WB}/`, { longer_alt: Token.Ident })
	static Keyword: TokenType;

	@token(re`/(and)${WB}/`, { longer_alt: Token.Ident })
	static And: TokenType;

	@token(re`/(or)${WB}/`, { longer_alt: Token.Ident })
	static Or: TokenType;

	@token(re`/(true|false)${WB}/`, { longer_alt: Token.Ident })
	static BoolLiteral: TokenType;

	@token(re`/(null)${WB}/`, { longer_alt: Token.Ident })
	static NullLiteral: TokenType;

	@token(re.merge(
		/#[a-fA-F0-9]{3,4}/,
		/#[a-fA-F0-9]{6}/,
		/#[a-fA-F0-9]{8}/,
		re`/\b(?:${ALL_COLORS.join("|")})\b/`,
	))
	static ColorLiteral: TokenType;

	@token(re`/@(${IDENT})/`)
	static AtWord: TokenType;

	@token(re`/\$(${IDENT})/`)
	static SassVar: TokenType;

	@token(re`/--(${IDENT})/`)
	static CustomProperty: TokenType;

	@token(/#{/)
	static HashBrace: TokenType;

	@token(/[{}]/)
	static Brace: TokenType;

	@token(/[[\]]/)
	static Bracket: TokenType;

	@token(/[()]/)
	static Paren: TokenType;

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

export const Lexer = new ChevLexer([
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
	Token.And,
	Token.Or,
	Token.AtWord,
	Token.SassVar,
	Token.CustomProperty,
	Token.Ident,
	// Delimiters
	Token.DQuote,
	Token.SQuote,
	Token.HashBrace,
	Token.Brace,
	Token.Bracket,
	Token.Paren,
	// Punctuation
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
]);
