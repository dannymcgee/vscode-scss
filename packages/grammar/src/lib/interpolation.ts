import { TMGrammarScope } from "@vscode-devkit/grammar";

export const interpolation: TMGrammarScope = {
	name: "meta.interpolation.scss",
	begin: /#\{/,
	beginCaptures: {
		0: { name: "punctuation.definition.interpolation.begin.scss" },
	},
	end: /\}/,
	endCaptures: {
		0: { name: "punctuation.definition.interpolation.end.scss" },
	},
	patterns: [{ include: "#value" }],
};
