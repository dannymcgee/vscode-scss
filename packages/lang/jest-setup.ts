import {
	LexingResultSerializer,
	TokenSerializer,
	RecordSerializer,
	CstNodeSerializer,
	RecognitionExceptionSerializer,
} from "@sassy/testing";

expect.addSnapshotSerializer(new RecordSerializer());
expect.addSnapshotSerializer(new LexingResultSerializer());
expect.addSnapshotSerializer(new CstNodeSerializer());
expect.addSnapshotSerializer(new RecognitionExceptionSerializer());
expect.addSnapshotSerializer(new TokenSerializer());
