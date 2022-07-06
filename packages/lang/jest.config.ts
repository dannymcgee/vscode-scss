/* eslint-disable */
import { readFileSync } from "fs";

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(
	readFileSync(`${__dirname}/.lib.swcrc`, "utf-8")
);
export default {
	displayName: "lang",
	preset: "../../jest.preset.js",
	transform: {
		"^.+\\.[tj]s$": ["@swc/jest", swcJestConfig],
	},
	snapshotResolver: "@sassy/snapshot-resolver",
	snapshotFormat: {
		printBasicPrototype: false,
	},
	setupFilesAfterEnv: ["./jest-setup.ts"],
	moduleFileExtensions: ["ts", "js", "html"],
	coverageDirectory: "../../coverage/packages/lang",
};
