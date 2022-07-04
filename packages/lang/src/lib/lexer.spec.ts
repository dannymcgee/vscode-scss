import { walk } from "@sassy/util";
import * as fs from "fs";
import * as path from "path";

import { Lexer } from "./lexer";

interface TestFile {
	pathName: string;
	source: string;
}

describe("Lexer", () => {
	let testFiles: TestFile[] = [];

	beforeAll(() => {
		testFiles = [];
		const root = path.join(__dirname, "__test-files__");

		walk(root, entry => {
			if (entry.isDirectory())
				return true;

			if (entry.isFile() && entry.name.endsWith(".scss")) {
				testFiles.push({
					pathName: entry.absolutePath
						.replace(root + path.sep, "")
						.replace(/[\\/]/g, "/"),
					source: fs.readFileSync(entry.absolutePath, { encoding: "utf-8" }),
				});
			}

			return false;
		});

		testFiles.reverse();
	});

	test("test files", () => {
		for (const testFile of testFiles) {
			const result = Lexer.tokenize(testFile.source);

			expect(result.errors).toHaveLength(0);
			expect(result).toMatchSnapshot(testFile.pathName);
		}
	});
});
