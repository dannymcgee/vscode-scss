import { TMGrammarScope } from "@vscode-devkit/grammar";

export const comment: TMGrammarScope = {
	patterns: [
		{
			name: "comment.block.documentation.scss",
			begin: /\/\/\//,
			beginCaptures: {
				0: { name: "punctuation.definition.comment.scss" },
			},
			end: /(?=$)/,
			patterns: [{ include: "source.sassdoc" }],
		},
		{
			name: "comment.line.scss",
			begin: /\/\//,
			beginCaptures: {
				0: { name: "punctuation.definition.comment.scss" },
			},
			end: /(?=$)/,
		},
		{
			name: "comment.block.scss",
			begin: /\/\*/,
			beginCaptures: {
				0: { name: "punctuation.definition.comment.begin.scss" },
			},
			end: /\*\//,
			endCaptures: {
				0: { name: "punctuation.definition.comment.end.scss" },
			},
		},
	],
};
