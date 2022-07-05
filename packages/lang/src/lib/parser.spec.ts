import { Parser } from "./parser";

describe("Parser", () => {
	let parser!: Parser;

	beforeAll(() => {
		parser = new Parser();
	});

	it("parses module load statements", () => {
		const input = `@use "sass:math";`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses import statements", () => {
		const input = `@import "path/to/stylesheet.css";`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses variable declaration statements", () => {
		const input = `$hello: "Hello, world!";`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses Sass directive statements", () => {
		const input = `
			@error "This is an error message";
			@warn "This is a warning message";
			@debug "This is a debug message";
		`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});
});
