import { Tok, Token } from "./token";

export interface TokenMatcher {
	kind: Tok;
	patterns: RegExp[];
}

export interface LexResult {
	input: string;
	tokens: Token[];
}
