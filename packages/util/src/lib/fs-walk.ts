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

export function walk(parent: string, visit: Fn<[FileEntry], boolean>) {
	const dirents = fs.readdirSync(parent, { withFileTypes: true });
	const children = dirents.map(ent => fileEntry(ent, path.join(parent, ent.name))); //({

	for (const child of children) {
		if (visit(child)) {
			walk(child.absolutePath, visit);
		}
	}
	// await Promise.all(children.map(async child => {
	// 	if (await visit(child)) {
	// 		await walk(child.absolutePath, visit);
	// 	}
	// }));
}
