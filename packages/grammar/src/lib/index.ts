import { comment } from "./comment";
import { interpolation } from "./interpolation";
import { keyword } from "./keyword";
import { literal } from "./literal";
import { operator } from "./operator";
import { punctuation } from "./punctuation";
import { selector } from "./selector";
import { value } from "./value";
import {
	ruleBlock,
	styleRule,
	atRule,
	varAssignment,
} from "./rule-block";

export const repository = {
	atRule,
	comment,
	interpolation,
	keyword,
	literal,
	operator,
	punctuation,
	ruleBlock,
	selector,
	styleRule,
	value,
	varAssignment,
};
