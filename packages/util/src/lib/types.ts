export interface Fn<Params extends unknown[] = [], R = void> {
	(...params: Params): R;
}

export type Const<T>
	= T extends Array<infer U>        ? readonly Const<U>[]
	: T extends Map<infer K, infer U> ? ReadonlyMap<K, Const<U>>
	: T extends Set<infer U>          ? ReadonlySet<Const<U>>
	: T extends Fn                    ? T
	: T extends object                ? { readonly [K in keyof T]: Const<T[K]> }
	: T;
