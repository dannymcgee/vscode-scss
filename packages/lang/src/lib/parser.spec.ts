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

	it("parses simple mixin definitions", () => {
		const input = `@mixin foo {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses parameterized mixin definitions", () => {
		const input = `@mixin foo($bar, $baz) {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses mixin definitions with empty param lists", () => {
		const input = `@mixin foo() {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses parameters with a trailing comma", () => {
		const input = `
		(
			$foo,
			$bar,
			$baz,
		)`;
		const result = parser.parse(input, "Parameters");

		expect(result).toMatchSnapshot();
	});

	it("parses parameters with default values", () => {
		const input = `($foo, $bar: "hello")`;
		const result = parser.parse(input, "Parameters");

		expect(result).toMatchSnapshot();
	});

	it("parses parameter lists", () => {
		const input = `($foo, $bar, $baz...)`;
		const result = parser.parse(input, "Parameters");

		expect(result).toMatchSnapshot();
	});

	it("parses function definitions", () => {
		const input = `
		@function hello($name) {
			@return "Hello, #{$name}!";
		}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses simple if statements", () => {
		const input = `@if "hello this is expression" {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses if/else statements", () => {
		const input = `
		@if "hello" {
		} @else {
		}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses if statements with multiple else clauses", () => {
		const input = `
		@if "hello" {
		} @else if "hello again" {
		} @else {
		}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});
});
