import { TMGrammar } from "@vscode-devkit/grammar";
import { repository } from "./lib";

export default {
	name: "scss",
	scopeName: "source.scss",
	patterns: [
		{ include: "#comment" },
		{ include: "#interpolation" },
		{ include: "#atRule" },
		{ include: "#varAssignment" },
		{ include: "#ruleBlock" },
		{ include: "#selector" },
	],
	repository,
} as TMGrammar;
