export function re(strings: TemplateStringsArray, ...values: (string | RegExp)[]): RegExp {
	let flags = "";
	let src = strings.raw.reduce((accum, curr, idx) => {
		const value = values[idx];

		if (typeof value === "string") {
			return accum + curr + value;
		}
		if (value != null) {
			flags += value.flags;
			return accum + curr + value.source;
		}
		return accum + curr;
	}, "");

	// Slice result into src (characters between the `/` delimiters)
	// and flags (characters after the last `/`)
	const endIdx = src.lastIndexOf("/");
	flags += src.substring(endIdx + 1);
	src = src.substring(1, endIdx);

	// Dedupe flags
	flags = flags
		.split("")
		.sort()
		.reduce((accum, c) => {
			if (accum.endsWith(c))
				return accum;

			return accum + c;
		}, "");

	return new RegExp(src, flags);
}

/** Join multiple patterns together with a `|` alternator. */
re.merge = function merge(...patterns: (string | RegExp)[]): RegExp {
	return re`/${
		patterns
			.map(p => {
				const src = typeof p === "string" ? p : p.source;
				return `(?:${src})`;
			})
			.join("|")
	}/`;
}
