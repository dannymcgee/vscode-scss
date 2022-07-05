import { CstNodeLocation } from "chevrotain";

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

	compare(other: Position): number {
		if (this.line === other.line) {
			return this.char - other.char;
		}
		return this.line - other.line;
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

	static fromChevLocation(loc: CstNodeLocation): Span {
		if (!loc) {
			throw new Error("Location is undefined");
		}
		if (
			loc.startLine == null
			|| loc.endLine == null
			|| loc.startColumn == null
			|| loc.endColumn == null
		) {
			throw new Error("Location is not fully defined");
		}

		const start = new Position(loc.startLine - 1, loc.startColumn - 1);
		const end = new Position(loc.endLine - 1, loc.endColumn);

		return new Span(start, end);
	}

	copy(): Span {
		return new Span(this.start.copy(), this.end.copy());
	}

	compareStart(other: Span): number {
		return this.start.compare(other.start);
	}

	compareEnd(other: Span): number {
		return this.end.compare(other.end);
	}

	toString(): string {
		if (this.start.line === this.end.line) {
			return `${this.start.line + 1}:(${this.start.char},${this.end.char})`;
		}
		return `(${this.start},${this.end})`;
	}
}
