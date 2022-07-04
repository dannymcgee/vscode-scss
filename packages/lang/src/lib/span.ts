import { IToken } from "chevrotain";

export class Position {
	/** Zero-indexed */
	line: number;
	/** Zero-indexed, relative to `line` */
	char: number;

	constructor (line = 0, char = 0) {
		this.line = line;
		this.char = char;
	}

	copy(): Position {
		return new Position(this.line, this.char);
	}

	toString(): string {
		return `${this.line + 1}:${this.char}`;
	}
}

export class Span {
	start: Position;
	end: Position;

	/**
	 * NOTE: Be sure to copy `start` and `end` if you plan to keep and mutate
	 * references to those objects.
	 */
	constructor (start: Position, end: Position) {
		this.start = start;
		this.end = end;
	}

	static fromToken(token: IToken): Span {
		if (
			token.startLine == null
			|| token.endLine == null
			|| token.startColumn == null
			|| token.endColumn == null
		) {
			throw new Error("token span is not fully defined");
		}

		const start = new Position(token.startLine - 1, token.startColumn - 1);
		const end = new Position(token.endLine - 1, token.endColumn);

		return new Span(start, end);
	}

	copy(): Span {
		return new Span(this.start.copy(), this.end.copy());
	}

	toString(): string {
		if (this.start.line === this.end.line) {
			return `${this.start.line + 1}:(${this.start.char},${this.end.char})`;
		}
		return `(${this.start},${this.end})`;
	}
}
