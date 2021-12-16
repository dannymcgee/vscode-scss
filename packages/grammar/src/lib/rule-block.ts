import { regex, TMGrammarScope } from "@vscode-devkit/grammar";
import { IDENT } from "./common";

export const ruleBlock: TMGrammarScope = {
	name: "meta.rule-block.scss",
	begin: /\{/,
	beginCaptures: {
		0: { name: "punctuation.definition.rule-block.start.scss" },
	},
	end: /\}/,
	endCaptures: {
		0: { name: "punctuation.definition.rule-block.end.scss" },
	},
	patterns: [
		{ include: "#interpolation" },
		{ include: "#varAssignment" },
		{ include: "#styleRule" },
		{ include: "#atRule" },
		{ include: "source.scss" },
	],
};

export const styleRule: TMGrammarScope = {
	name: "meta.rule.scss",
	patterns: [
		{
			begin: regex`/(${IDENT})(:)/`,
			beginCaptures: {
				1: { name: "support.type.property-name.scss" },
				2: { name: "punctuation.separator.key-value.scss" },
			},
			end: /(;)|(?=\})/,
			endCaptures: {
				1: { name: "punctuation.terminator.scss" },
			},
			patterns: [{ include: "#value" }],
		},
		{ include: "#selector" },
		{
			begin: /:/,
			beginCaptures: {
				0: { name: "punctuation.separator.key-value.scss" },
			},
			end: /(;)|(?=\})/,
			endCaptures: {
				1: { name: "punctuation.terminator.scss" },
			},
			patterns: [{ include: "#value" }],
		},
		{ include: "#literal" },
	],
};

export const varAssignment: TMGrammarScope = {
	name: "meta.var-assignment.scss",
	begin: regex`/((?:\$|--)${IDENT})(:)/`,
	beginCaptures: {
		1: { name: "variable.other.scss" },
		2: { name: "punctuation.separator.key-value.scss" },
	},
	end: /(;)|(?=\})/,
	endCaptures: {
		1: { name: "punctuation.terminator.scss" },
	},
	patterns: [{ include: "#value" }],
};

export const atRule: TMGrammarScope = {
	name: "meta.at-rule.scss",
	patterns: [
		{
			begin: regex`/((@)mixin)\s+(${IDENT})/`,
			beginCaptures: {
				1: { name: "storage.type.mixin.scss" },
				2: { name: "punctuation.definition.storage.scss" },
				3: { name: "entity.name.function.mixin.scss" },
			},
			end: /(?=\{)/,
			patterns: [{ include: "#value" }],
		},
		{
			begin: regex`/(@)extend\b/`,
			beginCaptures: {
				0: { name: "keyword.control.at-rule.extend.scss" },
				1: { name: "punctuation.definition.keyword.scss" },
			},
			end: /(;)|(?=\})/,
			endCaptures: {
				1: { name: "punctuation.terminator.scss" },
			},
			patterns: [{ include: "#selector" }],
		},
		{
			begin: regex`/(@)(${IDENT})/`,
			beginCaptures: {
				0: { name: "keyword.control.at-rule.$2.scss" },
				1: { name: "punctuation.definition.keyword.scss" },
			},
			end: /(;)|(?=\{)/,
			endCaptures: {
				1: { name: "punctuation.terminator.scss" },
			},
			patterns: [{ include: "#value" }],
		}
	]
};
