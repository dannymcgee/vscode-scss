import { Span } from "@sassy/lang";
import type { ILexingResult, IToken } from "chevrotain";
import { Config, Refs, Printer } from "pretty-format";
import type { SnapshotSerializer } from "./types";

export class LexingResultSerializer implements SnapshotSerializer<ILexingResult> {
	test(value: unknown): value is ILexingResult {
		return typeof value === "object"
			&& value !== null
			&& "tokens" in value
			&& Array.isArray((value as ILexingResult).tokens);
	}

	serialize(
		{ tokens, groups, errors }: ILexingResult,
		config: Config,
		indent: string,
		depth: number,
		refs: Refs,
		print: Printer,
	): string {
		indent ||= config.indent;

		const pad0 = indent.repeat(depth);
		const pad1 = indent.repeat(depth + 1);
		const pad2 = indent.repeat(depth + 2);
		const pad3 = indent.repeat(depth + 3);

		const groupEntries = Object.entries(groups);
		const printedGroups = groupEntries.length
			? `\n${pad2}` + groupEntries
				.map(([group, tokens]) => `${group}: [
${pad3}${printTokens(tokens, config, pad3, depth + 3, refs, print)}
${pad2}],`
				)
				.join(`\n${pad2}`)
				+ `\n${pad1}`
			: "";

		const printedErrors = errors.length
			? `\n${pad2}${
					errors
						.map(error => print(error, config, pad2, depth + 2, refs))
						.join(`,\n${pad2}`)
				}\n${pad1}`
			: "";

		return `(LexingResult
${pad1}tokens: [
${pad2}${printTokens(tokens, config, pad2, depth + 2, refs, print)}
${pad1}],
${pad1}groups: {${printedGroups}},
${pad1}errors: [${printedErrors}],
${pad0})`;
	}
}

function printTokens(
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

export class ChevTokenSerializer implements SnapshotSerializer<IToken> {
	test(value: unknown): value is IToken {
		return typeof value === "object"
			&& value !== null
			&& "image" in value
			&& typeof (value as IToken).image === "string"
			&& "tokenType" in value
			&& typeof (value as IToken).tokenType === "object"
			&& (value as IToken).tokenType !== null;
	}

	serialize(token: IToken): string {
		const lexeme = token.image.includes("\"")
			? `'${token.image}'`
			: `"${token.image}"`;
		const span = Span.fromToken(token);

		return `${lexeme} (${token.tokenType.name} (${span.toString()}))`
	}
}
