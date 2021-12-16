import { TMGrammarScope } from "@vscode-devkit/grammar";

export const punctuation: TMGrammarScope = {
	patterns: [
		{
			name: "meta.brace.curly.scss",
			match: /[{}]/,
		},
		{
			name: "meta.brace.square.scss",
			match: /[\[\]]/,
		},
		{
			name: "meta.brace.round.scss",
			match: /[()]/,
		},
		{
			name: "punctuation.separator.comma.scss",
			match: /,/,
		},
		{
			name: "punctuation.separator.key-value.scss",
			match: /:/,
		},
	],
};
