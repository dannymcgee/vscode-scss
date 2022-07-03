import { regex } from "@vscode-devkit/grammar";
import { Const } from "@sassy/util";

import { LexResult, TokenMatcher } from "./lexer.types";
import { Position, Span } from "./span";
import { Token } from "./token";

export class Lexer {
	private _matchers: TokenMatcher[];

	// The source text. This shouldn't be reassigned after `load`.
	private _input?: string;
	// The remaining text to match against. This is always a substring slice of
	// `_input` beginning with the end of the last token matched.
	private _rem?: string;

	// Represents the current cursor position in `_input`.
	private _ptr = 0;
	// The position at `_ptr`
	private _current = new Position();
	// Used for marking the end of a matched token.
	private _lookahead = new Position();

	constructor (matchers: Const<TokenMatcher[]>) {
		this._matchers = matchers.map(({ kind, patterns }) => ({
			kind,
			patterns: patterns.map(pat => regex`/^(?:${pat as RegExp})/` as RegExp),
		}));
	}

	load(input: string): void {
		this._input = input;
		this._rem = input;

		this._ptr = 0;
		this._current.reset();
		this._lookahead.reset();
	}

	scan(): Token | null {
		if (this._input === undefined || this._rem === undefined) {
			throw new Error("Tried to scan token without an input string.");
		}

		// Find a matching token
		for (const { kind, patterns } of this._matchers) {
			for (const pattern of patterns) {
				if (!(pattern instanceof RegExp)) {
					throw new Error(`Pattern is not a regular expression: \`${pattern}\``);
				}
				const match = this._rem.match(pattern);
				if (match) {
					const len = match[0].length;
					this._lookahead.character += len;

					const result = new Token(kind, {
						span: new Span(this._current, this._lookahead),
						offset: this._ptr,
						length: len,
					});

					this._ptr += len;
					this._rem = this._input.substring(this._ptr);
					this._current = this._lookahead.copy();

					return result;
				}
			}
		}

		// Consume whitespace
		const c = this._rem.charAt(0);
		if (c === "\n") {
			this._ptr++;
			this._lookahead.line++;
			this._lookahead.character = 0;
			this._current = this._lookahead.copy();
			this._rem = this._input.substring(this._ptr);

			return this.scan();
		}
		if (/[ \t\r]/.test(c)) {
			this._ptr++;
			this._lookahead.character++;
			this._current.character++;
			this._rem = this._input.substring(this._ptr);

			return this.scan();
		}

		if (this._ptr < this._input.length) {
			throw new Error(`Unrecognized token: \`${this._input.charAt(this._ptr)}\``);
		}

		return null;
	}

	scanAll(): Const<LexResult> {
		const result: Token[] = [];

		let next: Token | null = null;
		while ((next = this.scan())) {
			result.push(next);
		}

		return {
			input: this._input!,
			tokens: result,
		};
	}
}
