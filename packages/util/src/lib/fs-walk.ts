import * as fs from "fs";
import * as path from "path";

import { Fn } from "./types";

export interface FileEntry extends fs.Dirent {
	readonly absolutePath: string;
}

function fileEntry(ent: fs.Dirent, absolutePath: string): FileEntry {
	return Object.create(ent, {
		absolutePath: {
			value: absolutePath,
			writable: false,
			enumerable: true,
		},
	});
}

/**
 * Recursively traverse a file system path with a visitor.
 *
 * @param parent The root directory to begin walking.
 * @param visit  Callback invoked with the {@linkcode FileEntry} for each file
 *               or directory visited. Should return `true` to traverse into the
 *               given directory, or `false` to skip it.
 */
export function walk(parent: string, visit: Fn<[FileEntry], boolean>) {
	const dirents = fs.readdirSync(parent, { withFileTypes: true });
	const children = dirents.map(ent => fileEntry(ent, path.join(parent, ent.name)));

	for (const child of children) {
		if (visit(child)) {
			walk(child.absolutePath, visit);
		}
	}
}
