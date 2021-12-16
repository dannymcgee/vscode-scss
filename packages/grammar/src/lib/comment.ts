import { TMGrammarScope } from "@vscode-devkit/grammar";

export const comment: TMGrammarScope = {
	patterns: [
		{
			name: "comment.documentation.scss",
			begin: /\/\/\//,
			end: /(?=$)/,
		},
		{
			name: "comment.line.scss",
			begin: /\/\//,
			end: /(?=$)/,
		},
		{
			name: "comment.block.scss",
			begin: /\/\*/,
			end: /\*\//,
		},
	],
};
