import { re } from "./regex";

describe("regex", () => {
	it("supports simple regular expressions", () => {
		const jsIdent = re`/[_$a-zA-Z][_$a-zA-Z0-9]*/`;
		expect(jsIdent).toBeInstanceOf(RegExp);

		const [match] = "hello".match(jsIdent)!;
		expect(match).toEqual("hello");
	});

	it("supports interpolated strings", () => {
		const alpha = "a-zA-Z";
		const punct = "_$";
		const num = "0-9";
		const jsIdent = re`/[${punct}${alpha}][${punct}${alpha}${num}]*/`;

		expect(jsIdent).toBeInstanceOf(RegExp);

		const [hello] = "hello".match(jsIdent)!;
		expect(hello).toEqual("hello");

		const [$foo] = "$foo".match(jsIdent)!;
		expect($foo).toEqual("$foo");

		const [_fooBar42] = "_fooBar42".match(jsIdent)!;
		expect(_fooBar42).toEqual("_fooBar42");
	});

	it("supports interpolated regular expressions", () => {
		const alpha = /[a-zA-Z]/;
		const punct = /[_$]/;
		const num = /[0-9]/;
		const jsIdent = re`/(?:${punct}|${alpha})(?:${punct}|${alpha}|${num})*/`;

		expect(jsIdent).toBeInstanceOf(RegExp);

		const [hello] = "hello".match(jsIdent)!;
		expect(hello).toEqual("hello");

		const [$foo] = "$foo".match(jsIdent)!;
		expect($foo).toEqual("$foo");

		const [_fooBar42] = "_fooBar42".match(jsIdent)!;
		expect(_fooBar42).toEqual("_fooBar42");
	});

	it("supports flags", () => {
		const letters = re`/[a-z]+/i`;

		expect(letters).toBeInstanceOf(RegExp);

		const [hello] = "hello".match(letters)!;
		expect(hello).toEqual("hello");

		const [HELLO] = "HELLO".match(letters)!;
		expect(HELLO).toEqual("HELLO");

		const [hElLO] = "hElLO".match(letters)!;
		expect(hElLO).toEqual("hElLO");
	});

	it("combines flags from interpolated regular expressions", () => {
		const letters = /[a-z]/i;
		const allLetters = re`/${letters}/g`;

		expect(allLetters).toBeInstanceOf(RegExp);
		expect(allLetters.flags).toContain("i");
		expect(allLetters.flags).toContain("g");

		const matches = "Lorem Ipsum".match(allLetters);
		expect(matches).toHaveLength(10);
	});

	it("doesn't break when duplicate flags are passed", () => {
		const allAlpha = /[a-z]/g;
		const allNum = /[0-9]/g;
		const allAlphaNum = re`/(?:${allAlpha}|${allNum})/ig`;

		expect(allAlphaNum).toBeInstanceOf(RegExp);
		expect(allAlphaNum.flags).toContain("i");
		expect(allAlphaNum.flags).toContain("g");

		const matches = "abcABC123".match(allAlphaNum);
		expect(matches).toHaveLength(9);
	});
});
