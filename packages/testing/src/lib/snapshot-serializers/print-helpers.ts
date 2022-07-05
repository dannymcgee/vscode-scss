import type { IToken } from "chevrotain";
import { omitBy } from "lodash/fp";

import type { Config, Printer, Refs } from "./types";

export function printTokens(
	tokens: IToken[],
	config: Config,
	indent: string,
	depth: number,
	refs: Refs,
	print: Printer,
): string {
	return tokens
		.map(token => print(token, config, indent, depth, refs))
		.join(`\n${indent}`);
}

export function printObject<T extends object>(
	name: string,
	val: T,
	config: Config,
	indent: string,
	depth: number,
	refs: Refs,
	print: Printer,
): string {
	if (refs.indexOf(val) !== -1)
		return "[Circular]";

	refs = refs.concat(val);

	const definedProps = omitBy(v => v === undefined, val);

	return `(${name}${printObjectProperties(definedProps, config, indent, depth, refs, print)})`;
}

// Edited https://github.com/facebook/jest/blob/51fa61964f0b8f4d06db93a014b49b21ec53ea71/packages/pretty-format/src/collections.ts
// to render the object keys directly instead of calling `print` on them
// (removes quotes around the keys in the result)
export function printObjectProperties(
	val: Record<string, unknown>,
	config: Config,
	indent: string,
	depth: number,
	refs: Refs,
	print: Printer,
): string {
	let result = "";
	const keys = Object.keys(val);

	if (keys.length) {
		result += config.spacingOuter;

		const indentNext = indent + config.indent;

		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const value = print(val[key], config, indentNext, depth, refs);

			result += `${indentNext + key}: ${value}`;

			if (i < keys.length - 1) {
				result += `,${config.spacingInner}`;
			} else if (!config.min) {
				result += `,`;
			}
		}

		result += config.spacingOuter + indent;
	}

	return result;
}
