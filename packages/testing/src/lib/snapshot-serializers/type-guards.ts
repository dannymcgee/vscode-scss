import { CstNode, ILexingResult, IToken } from "chevrotain";

export function isLexingResult(value: unknown): value is ILexingResult {
	const maybe = value as ILexingResult;
	return typeof value === "object"
		&& value !== null
		&& "tokens" in value
		&& Array.isArray(maybe.tokens)
		&& "groups" in value
		&& typeof maybe.groups === "object"
		&& "errors" in value
		&& Array.isArray(maybe.errors);
}

export function isCstNode(value: unknown): value is CstNode {
	const maybe = value as CstNode;
	return typeof value === "object"
		&& value !== null
		&& "name" in value
		&& typeof maybe.name === "string"
		&& "children" in value
		&& isRecord(maybe.children);
}

export function isToken(value: unknown): value is IToken {
	const maybe = value as IToken;
	return typeof value === "object"
		&& value !== null
		&& "image" in value
		&& typeof maybe.image === "string"
		&& "tokenType" in value
		&& typeof maybe.tokenType === "object"
		&& maybe.tokenType !== null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object"
		&& value !== null
		&& !Array.isArray(value)
		&& !(value instanceof Map)
		&& !(value instanceof Set);
}
