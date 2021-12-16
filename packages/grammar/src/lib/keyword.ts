import { regex, TMGrammarScope } from "@vscode-devkit/grammar";
import { IDENT } from "./common";

export const keyword: TMGrammarScope = {
	patterns: [
		{
			name: "keyword.control.at-rule.$2.scss",
			match: regex`/(@)(${IDENT})/`,
			captures: {
				1: { name: "punctuation.definition.keyword.scss" },
			},
		},
		{
			name: "keyword.directive.$2.scss",
			match: regex`/(!)(${IDENT})/`,
			captures: {
				1: { name: "punctuation.definition.keyword.scss" },
			},
		},
		{
			name: "keyword.control.$1.scss",
			match: /\b(if|else|from|through|to|in|as|and|or)\b/
		},
	],
};
