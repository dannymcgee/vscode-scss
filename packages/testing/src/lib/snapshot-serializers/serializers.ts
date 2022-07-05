import type { Slice } from "@sassy/util";
import type { CstNode, ILexingResult, IToken } from "chevrotain";
import { Span } from "@sassy/lang";
import { isEmpty } from "lodash/fp";
import { printListItems } from "pretty-format/build/collections";

import type { SnapshotSerializer } from "./types";
import { printObject } from "./print-helpers";
import { isCstNode, isLexingResult, isRecord, isToken } from "./type-guards";

type SerializeParams<T = unknown> =
	Parameters<SnapshotSerializer<T>["serialize"]>;

export class RecordSerializer implements SnapshotSerializer<Record<string, unknown>> {
	test = isRecord;

	serialize(record: Record<string, unknown>, ...rest: Slice<1, SerializeParams>): string {
		const name = typeof record.constructor === "function"
			? record.constructor.name
			: "Object";

		return printObject(name, record, ...rest);
	}
}

export class LexingResultSerializer implements SnapshotSerializer<ILexingResult> {
	test = isLexingResult;

	serialize(
		{ tokens, groups, errors }: ILexingResult,
		...rest: Slice<1, SerializeParams>
	): string {
		const name = "LexingResult";
		const noGroups = isEmpty(groups);
		const noErrors = isEmpty(errors);

		if (noGroups && noErrors) {
			return `(${name}${printListItems(tokens, ...rest)})`;
		}
		if (noGroups) {
			return printObject(name, { tokens, errors }, ...rest);
		}
		if (noErrors) {
			return printObject(name, { tokens, groups }, ...rest);
		}

		return printObject(name, { tokens, groups, errors }, ...rest);
	}
}

export class CstNodeSerializer implements SnapshotSerializer<CstNode> {
	test = isCstNode;

	serialize(
		{ name, children: childMap, recoveredNode }: CstNode,
		...rest: Slice<1, SerializeParams>): string
	{
		const children = Object
			.values(childMap)
			.flatMap(elements =>
				elements.map(value => {
					const span = isToken(value)
						? Span.fromChevLocation(value)
						: Span.fromChevLocation(value.location!)

					return { ...value, span };
				}),
			)
			.sort((a, b) => a.span.compareStart(b.span));

		if (recoveredNode) {
			return `(${name}${printObject(name, { children, recoveredNode }, ...rest)})`;
		}
		return `(${name}${printListItems(children, ...rest)})`;
	}
}

export class TokenSerializer implements SnapshotSerializer<IToken> {
	test = isToken;

	serialize(token: IToken): string {
		const lexeme = token.image.includes("\"")
			? `'${token.image}'`
			: `"${token.image}"`;
		const span = Span.fromChevLocation(token);

		return `${lexeme} (${token.tokenType.name} (${span.toString()}))`;
	}
}
