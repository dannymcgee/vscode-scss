import { TMGrammar } from "@vscode-devkit/grammar";
import repository from "./lib";

export default {
	name: "scss-parser-snap",
	scopeName: "source.parser-snap",
	fileTypes: [".parser-snap"],
	patterns: [
		{ include: "#comment" },
		{ include: "#snapshotDecl" },
		{ include: "#nodeKind" },
		{ include: "#node" },
	],
	repository,
} as TMGrammar;
