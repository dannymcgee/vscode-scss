/**
 * Shorthand for a function type.
 *
 * @example
 * ```typescript
 * type Predicate<T> = Fn<[T], boolean>;
 * // type Predicate<T> = (value: T) => boolean;
 * ```
 */
export interface Fn<Params extends unknown[] = [], R = void> {
	(...params: Params): R;
}

/**
 * Shorthand for an async function type.
 *
 * @example
 * ```typescript
 * type AsyncPredicate<T> = AsyncFn<[T], boolean>;
 * // type AsyncPredicate<T> = (value: T) => Promise<boolean>;
 * ```
 */
export interface AsyncFn<Params extends unknown[] = [], R = void> {
	(...params: Params): Promise<R>;
}

/**
 * Creates a deeply immutable version of type `T`.
 */
export type Const<T>
	= T extends Array<infer U>        ? readonly Const<U>[]
	: T extends Map<infer K, infer U> ? ReadonlyMap<K, Const<U>>
	: T extends Set<infer U>          ? ReadonlySet<Const<U>>
	: T extends Fn                    ? T
	: T extends object                ? { readonly [K in keyof T]: Const<T[K]> }
	: T;

/**
 * Takes the subset of type `keyof T` where `T[K] extends U`
 *
 * @example
 * ```typescript
 * interface Foo {
 *   foo: string;
 *   bar(): void;
 *   baz(): boolean;
 * }
 *
 * type FooFuncKeys = KeysWhere<Foo, (...args: any[]) => any>;
 * // type FooFuncKeys = "bar" | "baz";
 * ```
 */
export type KeysWhere<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T]

/**
 * Takes a slice of a tuple `T` starting at `Idx` (up to a maximum `Idx` of 7).
 *
 * @example
 * ```typescript
 * function foo(a: string, b: number, c: boolean): void;
 * function bar(a: string, ...rest: Slice<1, Parameters<typeof foo>>): void;
 * // typeof foo === typeof bar
 * ```
 */
export type Slice<Idx extends number, T>
	= Idx extends 1
		? T extends [infer _, ...infer Rest]
			? [...Rest] : never
	: Idx extends 2
		? T extends [infer _, infer _, ...infer Rest]
			? [...Rest] : never
	: Idx extends 3
		? T extends [infer _, infer _, infer _, ...infer Rest]
			? [...Rest] : never
	: Idx extends 4
		? T extends [infer _, infer _, infer _, infer _, ...infer Rest]
			? [...Rest] : never
	: Idx extends 5
		? T extends [infer _, infer _, infer _, infer _, infer _, ...infer Rest]
			? [...Rest] : never
	: Idx extends 6
		? T extends [infer _, infer _, infer _, infer _, infer _, infer _, ...infer Rest]
			? [...Rest] : never
	: Idx extends 7
		? T extends [infer _, infer _, infer _, infer _, infer _, infer _, infer _, ...infer Rest]
			? [...Rest] : never
	: never;
