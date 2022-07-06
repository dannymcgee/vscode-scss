import { regex, TMGrammarScope } from "@vscode-devkit/grammar";

const IDENT = /[a-zA-Z][a-zA-Z0-9_]*/;
const PASCAL = /[A-Z][a-zA-Z0-9]*/;

const SCOPE = "parser-snap";

const comment: TMGrammarScope = {
	name: `comment.line.${SCOPE}`,
	match: /(\/\/).+/,
	captures: {
		1: { name: `punctuation.definition.comment.${SCOPE}` },
	},
};

const snapshotDecl: TMGrammarScope = {
	name: `meta.snapshot-declaration.${SCOPE}`,
	begin: /^(exports\[`)(.+)(`] = \`)/,
	beginCaptures: {
		1: { name: `comment.line.${SCOPE}` },
		2: { name: `entity.name.snapshot.${SCOPE}` },
		3: { name: `comment.line.${SCOPE}` },
	},
	end: /`;/,
	endCaptures: {
		0: { name: `comment.line.${SCOPE}` },
	},
	patterns: [
		{ include: "$self" },
	],
};

const node: TMGrammarScope = {
	name: `meta.syntax-node.${SCOPE}`,
	begin: regex`/(\()(${PASCAL})/`,
	beginCaptures: {
		1: { name: `punctuation.definition.syntax-node.begin.${SCOPE}` },
		2: { name: `entity.name.type.struct.${SCOPE}` },
	},
	end: /\)/,
	endCaptures: {
		0: { name: `punctuation.definition.syntax-node.end.${SCOPE}` },
	},
	patterns: [
		{ include: "#nodeField" },
		{ include: "#node" },
		{ include: "#token" },
		{ include: "#punctuation" },
	],
};

const nodeKind: TMGrammarScope = {
	name: `meta.syntax-node.kinded.${SCOPE}`,
	begin: regex`/(\()(${PASCAL})(::)(${PASCAL})/`,
	beginCaptures: {
		1: { name: `punctuation.definition.syntax-node.begin.${SCOPE}` },
		2: { name: `entity.name.type.enum.${SCOPE}` },
		3: { name: `punctuation.accessor.enummember.${SCOPE}` },
		4: { name: `variable.other.enummember.${SCOPE}` },
	},
	end: /\)/,
	endCaptures: {
		0: { name: `punctuation.definition.syntax-node-end.${SCOPE}` },
	},
	// prettier-ignore
	patterns: [
		{ include: "#nodeKind" },
		{ include: "#node" },
		{ include: "#token" },
		{ include: "#punctuation" },
	],
};

const nodeField: TMGrammarScope = {
	name: `meta.syntax-node.child.${SCOPE}`,
	begin: regex`/(${IDENT})(:)/`,
	beginCaptures: {
		1: { name: `variable.other.property.${SCOPE}` },
		2: { name: `punctuation.separator.key-value.${SCOPE}` },
	},
	end: /,/,
	endCaptures: {
		0: { name: `punctuation.separator.comma.${SCOPE}` },
	},
	patterns: [
		{ include: "#nodeKind" },
		{ include: "#node" },
		{ include: "#token" },
		{ include: "#array" },
		{ include: "#string" },
		{ include: "#numbers" },
		{ include: "#punctuation" },
	],
};

const string: TMGrammarScope = {
	patterns: [
		{
			name: `string.quoted.double.${SCOPE}`,
			begin: /"/,
			beginCaptures: {
				0: { name: `punctuation.definition.string.begin.${SCOPE}` },
			},
			end: /(?<!\\)(")|\\\\(")/,
			endCaptures: {
				0: { name: `punctuation.definition.string.end.${SCOPE}` },
			},
		},
		{
			name: `string.quoted.single.${SCOPE}`,
			begin: /'/,
			beginCaptures: {
				0: { name: `punctuation.definition.string.begin.${SCOPE}` },
			},
			end: /(?<!\\)(')|\\\\(')/,
			endCaptures: {
				0: { name: `punctuation.definition.string.end.${SCOPE}` },
			},
		},
	],
};

const token: TMGrammarScope = {
	name: `meta.token.${SCOPE}`,
	begin: regex`/((?<q>['"]).+(\k<q>)) (\()(${PASCAL})/`,
	beginCaptures: {
		// 1: { name: `punctuation.definition.string.begin.${SCOPE}` },
		1: { name: `meta.token.lexeme.${SCOPE} string.quoted.${SCOPE}` },
		2: { name: `punctuation.definition.string.begin.${SCOPE}` },
		3: { name: `punctuation.definition.string.end.${SCOPE}` },
		4: { name: `punctuation.brace.round.${SCOPE}` },
		5: { name: `meta.token.kind.${SCOPE} variable.other.enummember.${SCOPE}` },
	},
	end: /\)/,
	endCaptures: {
		0: { name: `punctuation.brace.round.${SCOPE}` },
	},
	// prettier-ignore
	patterns: [
		{ include: "#string" },
		{ include: "#span" },
		{ include: "#punctuation" },
	],
};

const span: TMGrammarScope = {
	name: `meta.token.span.${SCOPE}`,
	begin: /\((?=[0-9])/,
	beginCaptures: {
		0: { name: `punctuation.brace.round.${SCOPE}` },
	},
	end: /\)/,
	endCaptures: {
		0: { name: `punctuation.brace.round.${SCOPE}` },
	},
	// prettier-ignore
	patterns: [
		{ include: "#span" },
		{ include: "#numbers" },
		{ include: "#punctuation" },
	],
};

const array: TMGrammarScope = {
	name: `meta.array.${SCOPE}`,
	begin: /\[/,
	beginCaptures: {
		0: { name: `punctuation.definition.array.begin.${SCOPE}` },
	},
	end: /\]/,
	endCaptures: {
		0: { name: `punctuation.definition.array.end.${SCOPE}` },
	},
	patterns: [
		{ include: "#nodeKind" },
		{ include: "#node" },
		{ include: "#token" },
		{ include: "#string" },
		{ include: "#numbers" },
		{ include: "#punctuation" },
	],
};

const punctuation: TMGrammarScope = {
	patterns: [
		{
			name: `punctuation.brace.square.${SCOPE}`,
			// eslint-disable-next-line no-useless-escape
			match: /[\[\]]/,
		},
		{
			name: `punctuation.separator.comma.${SCOPE}`,
			match: /,/,
		},
		{
			name: `punctuation.accessor.enum-variant.${SCOPE}`,
			match: /::/,
		},
		{
			name: `punctuation.separator.key-value.${SCOPE}`,
			match: /:/,
		},
		{
			name: `keyword.operator.range.${SCOPE}`,
			match: /\.\.\./,
		},
	],
};

const numbers: TMGrammarScope = {
	name: `constant.numeric.${SCOPE}`,
	match: /[0-9]+/,
};

export default {
	array,
	comment,
	node,
	nodeKind,
	nodeField,
	numbers,
	punctuation,
	snapshotDecl,
	span,
	string,
	token,
};
