import {
	testPathForConsistencyCheck,
	resolveSnapshotPath,
	resolveTestPath,
} from "./resolver";

describe("snapshot-resolver", () => {
	it("should pass consistency check", () => {
		const pathToSnap = resolveSnapshotPath(testPathForConsistencyCheck);
		const pathToTest = resolveTestPath(pathToSnap);

		expect(pathToTest).toEqual(testPathForConsistencyCheck);
	});
});
