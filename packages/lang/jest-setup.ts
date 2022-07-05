import {
	LexingResultSerializer,
	TokenSerializer,
	RecordSerializer,
	CstNodeSerializer,
} from "@sassy/testing";

expect.addSnapshotSerializer(new RecordSerializer());
expect.addSnapshotSerializer(new LexingResultSerializer());
expect.addSnapshotSerializer(new CstNodeSerializer());
expect.addSnapshotSerializer(new TokenSerializer());
