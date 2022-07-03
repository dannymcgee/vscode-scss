export class Position {
	/** Zero-indexed */
	line: number;
	/** Zero-indexed, relative to `line` */
	character: number;

	constructor (line = 0, character = 0) {
		this.line = line;
		this.character = character;
	}

	copy(): Position {
		return new Position(this.line, this.character);
	}

	reset(): void {
		this.line = 0;
		this.character = 0;
	}

	toString(): string {
		return `${this.line + 1}:${this.character}`;
	}
}

export class Span {
	start: Position;
	end: Position;

	constructor (start: Position, end: Position) {
		this.start = start.copy();
		this.end = end.copy();
	}

	copy(): Span {
		return new Span(this.start.copy(), this.end.copy());
	}

	toString(): string {
		if (this.start.line === this.end.line) {
			return `${this.start.line + 1}:(${this.start.character},${this.end.character})`;
		}
		return `(${this.start},${this.end})`;
	}
}
