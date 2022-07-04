import type { NewPlugin } from "pretty-format";
import type * as PrettyFmt from "pretty-format";

export { Refs, Printer } from "pretty-format";

export type Config<T extends (object | undefined) = undefined> =
	T extends undefined
		? PrettyFmt.Config
		: PrettyFmt.Config & { extras?: T };

export type SnapshotSerializer<T, Cfg extends (object | undefined) = undefined> = {
	[K in keyof NewPlugin]:
		NewPlugin[K] extends (val: unknown, config: Config, ...rest: infer Params) => string
			? (val: T, config: Config<Cfg>, ...rest: Params) => string
			: NewPlugin[K];
}
