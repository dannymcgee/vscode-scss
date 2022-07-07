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

	it("parses @if statements", () => {
		const input = `@if $condition {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses @if / @else statements", () => {
		const input = `
		@if $condition {
		} @else {
		}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses @if / @else if / @else statements", () => {
		const input = `
		@if $foo {
		} @else if $bar {
		} @else {
		}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses @each statements", () => {
		const input = `@each $item in $list {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses @each statements with destructuring", () => {
		const input = `
		@each $key, $value in $map {}
		@each $foo, $bar, $baz in $lists {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses @for statements", () => {
		const through = `@for $i from 1 through 10 {}`;
		let result = parser.parse(through);

		expect(result).toMatchSnapshot("with 'through' keyword");

		const to = `@for $i from 1 to 10 {}`;
		result = parser.parse(to);

		expect(result).toMatchSnapshot("with 'to' keyword");
	});

	it("parses @while statements", () => {
		const input = `@while true {}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});

	it("parses blocks with optional final semicolon", () => {
		const withSemi = `
		{
			$foo: "foo";
			$bar: "bar";
			$baz: "baz";
		}`;
		let result = parser.parse(withSemi, "Block");
		expect(result).toMatchSnapshot("WITH semicolon");

		const withoutSemi = `
		{
			$foo: "foo";
			$bar: "bar";
			$baz: "baz"
		}`;
		result = parser.parse(withoutSemi, "Block");
		expect(result).toMatchSnapshot("WITHOUT semicolon");
	});

	it("parses simple selectors", () => {
		const selectors = {
			"* selector": `*`,
			"tag selector": `div`,
			"pseudo-element selector": `::after`,
			"pseudo-class selector": `:hover`,
			"pseudo-class selector with arguments": `:nth-child(2)`,
			"class selector": `.foo`,
			"ID selector": `#foo`,
			"attribute selector": `[data-foo]`,
			"attribute selector with value": `[class^="col-"]`,
		};

		for (const [name, input] of Object.entries(selectors)) {
			const result = parser.parse(input, "Selector");
			expect(result).toMatchSnapshot(name);
		}
	});

	it("parses compound selectors", () => {
		const inputs = [
			`div.foo`,
			`.foo.bar.baz`,
			`#foo.bar`,
			`.foo#bar::after:hover`,
		];

		for (const input of inputs) {
			const result = parser.parse(input, "SelectorList");
			expect(result).toMatchSnapshot();
		}
	});

	it("parses selector lists", () => {
		const inputs = [
			`*::before, *::after`,
			`h1, h2, h3, h4, h5`,
			`label > input[type="checkbox"], label > input[type="radio"]`,
			`&:hover, &:focus, &:active`,
			`&:not(:last-child)`,
		];

		for (const input of inputs) {
			const result = parser.parse(input, "SelectorList");
			expect(result).toMatchSnapshot();
		}
	});

	it("parses style rules", () => {
		const input = `
		.foo {
		}`;
		const result = parser.parse(input);

		expect(result).toMatchSnapshot();
	});
});
