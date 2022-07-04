import { createToken, ITokenConfig, TokenPattern } from "chevrotain";

export function token(
	pattern: TokenPattern,
	extras: Omit<ITokenConfig, "name"|"pattern"> = {},
): PropertyDecorator {
	return (target, key) => {
		if (typeof key !== "string") {
			throw new Error("@token must decorate a property with a string key");
		}

		Object.defineProperty(target, key, {
			value: createToken({
				name: key,
				pattern,
				...extras,
			}),
			writable: false,
			enumerable: true,
		});
	}
}
