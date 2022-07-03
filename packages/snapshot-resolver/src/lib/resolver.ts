import type { Config } from "@jest/types";
import * as path from "path";

export const testPathForConsistencyCheck =
	path.resolve(process.cwd(), "path/to/my-module/my-module.spec.tsx");

export function resolveSnapshotPath(testPath: Config.Path, _extension?: string): Config.Path {
	const ext = getSnapshotExtension(testPath);

	return path.join(
		path.join(path.dirname(testPath), "__snapshots__"),
		path.basename(testPath) + ext,
	);
}

export function resolveTestPath(snapshotPath: Config.Path, _extension?: string): Config.Path {
	const ext = getSnapshotExtension(snapshotPath);

	return path.resolve(
		path.dirname(snapshotPath),
		"..",
		path.basename(snapshotPath, ext),
	);
}

function getSnapshotExtension(pathName: Config.Path): string {
	const normalized = pathName.replace(/[\\/]/g, "/");
	const packageMatch = normalized.match(/.+?\/packages\/([^/]+)\//);

	if (!packageMatch) return ".snap";

	return `.${packageMatch[1]}-snap`;
}
