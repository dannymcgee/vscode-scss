import { TMGrammarScope } from "@vscode-devkit/grammar";

export const literal: TMGrammarScope = {
	patterns: [
		{
			name: "string.scss",
			begin: /(")/,
			beginCaptures: {
				1: { name: "punctuation.definition.string.begin.scss" },
			},
			end: /(?<!\\)(")|\\\\(")/,
			endCaptures: {
				1: { name: "punctuation.definition.string.end.scss" },
				2: { name: "punctuation.definition.string.end.scss" },
			},
			patterns: [{ include: "#interpolation" }],
		},
		{
			name: "string.scss",
			begin: /(')/,
			beginCaptures: {
				1: { name: "punctuation.definition.string.begin.scss" },
			},
			end: /(?<!\\)(')|\\\\(')/,
			endCaptures: {
				1: { name: "punctuation.definition.string.end.scss" },
				2: { name: "punctuation.definition.string.end.scss" },
			},
			patterns: [{ include: "#interpolation" }],
		},
		{
			match: /(-?(?:\.?[0-9]+|[0-9]+[.0-9]*))(px|pt|pc|%|fr|cm|mm|Q|in|r?em|ex|ch|lh|vw|vh|vmin|vmax|m?s)?/,
			captures: {
				1: { name: "constant.numeric.scss" },
				2: { name: "keyword.other.unit.$2.scss" },
			},
		},
		{
			name: "constant.numeric.color.scss",
			match: /#[a-fA-F0-9]{3,8}/,
		},
		{
			name: "constant.language.boolean.scss",
			match: /\b(true|false)\b/,
		},
		{
			name: "constant.language.null.scss",
			match: /\bnull\b/,
		},
	],
};
