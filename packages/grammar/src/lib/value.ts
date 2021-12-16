import { regex, TMGrammarScope } from "@vscode-devkit/grammar";
import { IDENT } from "./common";

export const value: TMGrammarScope = {
	patterns: [
		{ include: "#comment" },
		{ include: "#interpolation" },
		{ include: "#literal" },
		{ include: "#keyword" },
		{
			name: "variable.other.scss",
			match: regex`/(\$|--)${IDENT}/`,
		},
		{
			match: regex`/(${IDENT})(\.)/`,
			captures: {
				1: { name: "entity.name.module.scss" },
				2: { name: "punctuation.accessor.scss" },
			},
		},
		{
			name: "entity.name.function.scss",
			match: regex`/(?<=\.)${IDENT}/`,
		},
		{
			name: "entity.name.function.scss",
			match: regex`/${IDENT}(?=\()/`,
		},
		{
			name: "support.constant.property-value.css",
			match: IDENT,
		},
		{ include: "#operator" },
		{ include: "#punctuation" },
		{
			name: "keyword.operator.other.transclude.scss",
			match: /&/,
		}
	],
};
