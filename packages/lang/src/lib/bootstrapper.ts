/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fn } from "@sassy/util";
import {
	CstParser,
	EmbeddedActionsParser,
	IParserConfig,
	Lexer as ChevLexer,
	TokenType,
} from "chevrotain";

import { Token } from "./lexer";
import { token } from "./util";

class BsToken {
	@token(/\s+/, { group: ChevLexer.SKIPPED })
	static Whitespace: TokenType;

	@token(/\?=>/)
	static LA: TokenType;

	@token(/\?/)
	static Option: TokenType;

	@token(/=/)
	static Rule: TokenType;

	@token(/\|/)
	static Or: TokenType;

	@token(/\*/)
	static Many: TokenType;

	@token(/\+/)
	static AtLeastOne: TokenType;

	@token(/~/)
	static Not: TokenType;

	@token(/\(/)
	static LParen: TokenType;

	@token(/\)/)
	static RParen: TokenType;

	@token(/\[/)
	static LBracket: TokenType;

	@token(/\]/)
	static RBracket: TokenType;

	@token(/;/)
	static Terminator: TokenType;

	@token(/\{([_a-zA-Z][_a-zA-Z0-9]*)\}/)
	static TokenName: TokenType;

	@token(/[_a-zA-Z][_a-zA-Z0-9]*/)
	static Ident: TokenType;
}

const BsLexer = new ChevLexer(Object.values(BsToken));

type Rule = {
	method: "RULE";
	name: string;
	children: Production[];
}
type Production =
	| Consume
	| Subrule
	| Or
	| Option
	| Many
	| AtLeastOne;

type Consume = {
	method: "CONSUME";
	value: TokenType;
}
type Subrule = {
	method: "SUBRULE";
	value: string;
}
type Or = {
	method: "OR";
	children: Production[];
}
type Option = {
	method: "OPTION";
	children: Production[];
}
type Many = {
	method: "MANY";
	sep?: TokenType;
	children: Production[];
}
type AtLeastOne = {
	method: "AT_LEAST_ONE";
	sep?: TokenType;
	children: Production[];
}

class GrammarParser extends EmbeddedActionsParser {
	constructor () {
		super(Object.values(BsToken));
		this.performSelfAnalysis();
	}

	Grammar = this.RULE("Grammar", () => {
		const result: Rule[] = [];
		this.MANY(() => {
			result.push(this.SUBRULE(this.Rule));
		});

		return result;
	});

	Rule = this.RULE("Rule", () => {
		const result: Rule = {
			method: "RULE",
			name: this.CONSUME(BsToken.Ident).image,
			children: [] as Production[],
		};

		while (this.LA(1).tokenType !== BsToken.Terminator) {
			result.children.push(this.SUBRULE(this.Production));
		}

		this.CONSUME(BsToken.Terminator);

		return result;
	});

	Production = this.RULE("Production", () => {
		const result = {} as any;

		switch (this.LA(1).tokenType) {
			case BsToken.Ident:
				return {
					method: "SUBRULE",
					value: this.CONSUME(BsToken.Ident).image,
				} as const;

			case BsToken.TokenName: {
				const { image } = this.CONSUME(BsToken.TokenName);
				const [, tokenName] = image.match(BsToken.TokenName.PATTERN as RegExp)!;

				return {
					method: "CONSUME",
					value: Token[tokenName as keyof typeof Token] as TokenType,
				} as const;
			}

			default: {
				throw new Error("Unimplemented");
			}
		}
	});
}

export class Bootstrapper extends CstParser {
	private _vocabulary: TokenType[];
	private _grammarParser = new GrammarParser();

	constructor (vocabulary: TokenType[], config?: IParserConfig) {
		super(vocabulary, config);
		this._vocabulary = vocabulary;
	}

	grammar(strings: TemplateStringsArray, ...values: TokenType[]) {
		const input = strings.reduce((accum, str, idx) => {
			const token = values[idx];
			if (token) return accum + str + `{${token.name}}`;
			return accum + str;
		}, "");
		const { tokens } = BsLexer.tokenize(input);

		this._grammarParser.input = tokens;
		const grammar = this._grammarParser.Grammar();
	}

	protected NOT(selector: TokenType | TokenType[]) {
		const pred: Fn<[TokenType], boolean> = Array.isArray(selector)
			? type => !selector.includes(type)
			: type => type !== selector;

		return this.OR(this._vocabulary
			.filter(pred)
			.map(type => ({
				ALT: () => this.CONSUME(type),
			})),
		);
	}
}
