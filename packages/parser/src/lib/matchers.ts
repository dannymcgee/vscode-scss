import { Const } from "@sassy/util";
import { regex } from "@vscode-devkit/grammar";

import { TokenMatcher } from "./lexer.types";
import { Tok } from "./token";

const UNIT =
	/(?:cm|mm|Q|in|pc|pt|px|em|ex|ch|rem|lh|rlh|vw|vh|vmin|vmax|vb|vi|svw|svh|lvw|lvh|dvw|dvh|%)/;
const IDENT = /[_a-zA-Z][-_a-zA-Z0-9]*/;
const WB = /(?=[^-_a-zA-Z0-9])/;

const NUM_LITERAL_MATCHER: Const<TokenMatcher> = {
	kind: Tok.NumLiteral,
	patterns: [
		/#[a-fA-F0-9]{3,4}/,
		/#[a-fA-F0-9]{6}/,
		/#[a-fA-F0-9]{8}/,
		regex`/-?[0-9]+[.0-9]*(?:${UNIT})?/` as RegExp,
		regex`/-?\.?[0-9]+(?:${UNIT})?/` as RegExp,
	],
};

const STR_LITERAL_MATCHER: Const<TokenMatcher> = {
	kind: Tok.StrLiteral,
	patterns: [
		/"(?:[^"]|(?:\\"))+"/,
		/'(?:[^"]|(?:\\'))+'/,
	],
};

export const COARSE_MATCHERS: Const<TokenMatcher[]> = [
	{
		kind: Tok.Comment,
		patterns: [/\/\/.+/, /\/\*.+?\*\//],
	},
	{
		kind: Tok.Ident,
		patterns: [regex`/(?:--|@|\$)?${IDENT}/` as RegExp],
	},
	{
		kind: Tok.Delim,
		patterns: [/(?:[{}[\]()]|#{)/],
	},
	NUM_LITERAL_MATCHER,
	{
		kind: Tok.Punct,
		patterns: [/[:;.,#]/],
	},
	{
		kind: Tok.Operator,
		patterns: [/[-+=*/!^|~$<>&]/],
	},
	STR_LITERAL_MATCHER,
];

export const FINE_MATCHERS: Const<TokenMatcher[]> = [
	{
		kind: Tok.SassDoc,
		patterns: [/\/\/\/.+/],
	},
	{
		kind: Tok.Comment,
		patterns: [/\/\/.+/],
	},
	{
		kind: Tok.AtWord,
		patterns: [regex`/@${IDENT}/` as RegExp],
	},
	{
		kind: Tok.Keyword,
		patterns: [regex`/(if|else|from|through|to|in|as|and|or)${WB}/` as RegExp],
	},
	{
		kind: Tok.SassVar,
		patterns: [regex`/\$${IDENT}/` as RegExp],
	},
	{
		kind: Tok.CssVar,
		patterns: [regex`/--${IDENT}/` as RegExp],
	},
	{
		kind: Tok.And,
		patterns: [regex`/(and)${WB}/` as RegExp],
	},
	{
		kind: Tok.Or,
		patterns: [regex`/(or)${WB}/` as RegExp],
	},
	{
		kind: Tok.Ident,
		patterns: [IDENT],
	},
	{
		kind: Tok.HashBrace,
		patterns: [/#{/],
	},
	{
		kind: Tok.Brace,
		patterns: [/[{}]/],
	},
	{
		kind: Tok.Bracket,
		patterns: [/[[\]]/],
	},
	{
		kind: Tok.Paren,
		patterns: [/[()]/],
	},
	{
		kind: Tok.ColonColon,
		patterns: [/::/],
	},
	{
		kind: Tok.Colon,
		patterns: [/:/],
	},
	{
		kind: Tok.Semicolon,
		patterns: [/;/],
	},
	NUM_LITERAL_MATCHER,
	{
		kind: Tok.Dot,
		patterns: [/\./],
	},
	{
		kind: Tok.Comma,
		patterns: [/,/],
	},
	{
		kind: Tok.Hash,
		patterns: [/#/],
	},
	{
		kind: Tok.Plus,
		patterns: [/\+/],
	},
	{
		kind: Tok.Minus,
		patterns: [/-/],
	},
	{
		kind: Tok.EqualEqual,
		patterns: [/==/],
	},
	{
		kind: Tok.Equal,
		patterns: [/=/],
	},
	{
		kind: Tok.StarEqual,
		patterns: [/\*=/],
	},
	{
		kind: Tok.Star,
		patterns: [/\*/],
	},
	{
		kind: Tok.BangEqual,
		patterns: [/!=/],
	},
	{
		kind: Tok.Bang,
		patterns: [/!/],
	},
	{
		kind: Tok.CaretEqual,
		patterns: [/\^=/],
	},
	{
		kind: Tok.Caret,
		patterns: [/\^/],
	},
	{
		kind: Tok.BarEqual,
		patterns: [/\|=/],
	},
	{
		kind: Tok.Bar,
		patterns: [/\|/],
	},
	{
		kind: Tok.TildeEqual,
		patterns: [/~=/],
	},
	{
		kind: Tok.Tilde,
		patterns: [/~/],
	},
	{
		kind: Tok.DollarEqual,
		patterns: [/\$=/],
	},
	{
		kind: Tok.Dollar,
		patterns: [/\$/],
	},
	{
		kind: Tok.LessEqual,
		patterns: [/<=/],
	},
	{
		kind: Tok.Less,
		patterns: [/</],
	},
	{
		kind: Tok.GreaterEqual,
		patterns: [/>=/],
	},
	{
		kind: Tok.Greater,
		patterns: [/>/],
	},
	{
		kind: Tok.Ampersand,
		patterns: [/&/],
	},
	STR_LITERAL_MATCHER,
];
