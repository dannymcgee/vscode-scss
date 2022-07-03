/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LexResult } from "@sassy/parser";
import { Token, Tok } from "@sassy/parser";

import type { Refs, NewPlugin, Printer } from "pretty-format";
import type * as PrettyFmt from "pretty-format";

type Config<T extends (object | undefined) = undefined> =
	T extends undefined
		? PrettyFmt.Config
		: PrettyFmt.Config & { extras?: T };

type SnapshotSerializer<T, Cfg extends (object | undefined) = undefined> = {
	[K in keyof NewPlugin]:
		NewPlugin[K] extends (val: any, config: Config, ...rest: infer Params) => string
			? (val: T, config: Config<Cfg>, ...rest: Params) => string
			: NewPlugin[K];
}

// class Tokens extends Array<Token> {}

export class LexResultSerializer implements SnapshotSerializer<LexResult> {
	test(value: unknown): boolean {
		return typeof value === "object"
			&& value !== null
			&& "input" in value
			&& typeof (value as any).input === "string"
			&& "tokens" in value
			&& typeof (value as any).tokens === "object"
			&& (value as any).tokens !== null
			&& Array.isArray((value as any).tokens)
			&& ((value as any).tokens as any[]).every(v => v instanceof Token);
	}

	serialize(
		{ input, tokens }: LexResult,
		config: Config,
		_: string,
		depth: number,
		refs: Refs,
		print: Printer,
	): string {
		const indent = config.indent;

		const pad0 = indent.repeat(depth);
		const pad1 = indent.repeat(depth + 1);
		const pad2 = indent.repeat(depth + 2);

		const tokenConfig = {
			...config,
			extras: { input },
		};

		return `(LexResult\n${pad1}tokens: [\n${pad2}${
			tokens
				.map(token => print(token, tokenConfig, indent, depth + 2, refs))
				.join(`\n${pad2}`)
		}\n${pad1}],\n${pad0})`;
	}
}

interface TokenExtras {
	input: string;
}

export class TokenSerializer implements SnapshotSerializer<Token, TokenExtras> {
	test(value: unknown): boolean {
		return value instanceof Token;
	}

	serialize(token: Token, config: Config<TokenExtras>): string {
		let lexeme = "<unknown>";
		if (config.extras) {
			lexeme = token.lexeme(config.extras.input);
			if (lexeme.includes("\"")) {
				lexeme = `'${lexeme}'`;
			} else {
				lexeme = `"${lexeme}"`;
			}
		}

		return `${lexeme} (${Tok[token.kind]} (${token.span.toString()}))`
	}
}
