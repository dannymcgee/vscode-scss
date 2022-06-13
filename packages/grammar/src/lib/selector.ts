import { regex, TMGrammarScope } from "@vscode-devkit/grammar";
import { IDENT } from "./common";

export const selector: TMGrammarScope = {
	patterns: [
		{ include: "#comment" },
		{ include: "#interpolation" },
		{
			name: "meta.selector.class.scss",
			match: regex`/(\.)(${IDENT})/`,
			captures: {
				0: { name: "entity.other.attribute-name.class.css" },
				1: { name: "punctuation.definition.entity.scss" },
			},
		},
		{
			name: "meta.selector.id.scss",
			match: regex`/(#)(${IDENT})/`,
			captures: {
				0: { name: "entity.other.attribute-name.id.scss" },
				1: { name: "punctuation.definition.entity.scss" },
			}
		},
		{
			name: "meta.selector.pseudo-element.scss",
			match: regex`/(::)(${IDENT})/`,
			captures: {
				0: { name: "entity.other.attribute-name.pseudo-element.css" },
				1: { name: "punctuation.definition.entity.scss" },
			},
		},
		{
			name: "meta.selector.pseudo-class.scss",
			match: regex`/(:)(${IDENT})/`,
			captures: {
				0: { name: "entity.other.attribute-name.pseudo-class.css" },
				1: { name: "punctuation.definition.entity.scss" },
			},
		},
		{
			name: "meta.selector.attribute.scss",
			begin: /\[/,
			beginCaptures: {
				0: { name: "punctuation.definition.attribute-selector.begin.scss" },
			},
			end: /\]/,
			endCaptures: {
				0: { name: "punctuation.definition.attribute-selector.end.scss" },
			},
			patterns: [
				{
					name: "entity.other.attribute-name.attribute.css",
					match: IDENT,
				},
				{ include: "#operator" },
				{ include: "#literal" },
			],
		},
		{
			match: regex`/(&)(${IDENT})/`,
			captures: {
				1: { name: "keyword.operator.other.transclude.scss" },
				2: { name: "entity.other.attribute-name.class.css" },
			},
		},
		{
			match: IDENT,
			name: "entity.name.tag.scss",
		},
		{
			name: "keyword.operator.other.transclude.scss",
			match: /&/,
		},
		{
			name: "entity.name.tag.wildcard.scss",
			match: /\*/,
		},
		{
			name: "keyword.operator.combinator.scss",
			match: /[+>~]/,
		},
		{
			name: "punctuation.separator.comma.scss",
			match: /,/,
		},
	],
};
