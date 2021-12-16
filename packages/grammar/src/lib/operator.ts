import { TMGrammarScope } from "@vscode-devkit/grammar";

export const operator: TMGrammarScope = {
	patterns: [
		{
			name: "keyword.operator.arithmetic.scss",
			match: /[-+=*\/]/,
		},
		{
			name: "keyword.operator.comparison.scss",
			match: /[=!^|*~$<>]=|[<>]/,
		},
		{
			name: "keyword.operator.assignment.scss",
			match: /=/,
		},
	],
};
