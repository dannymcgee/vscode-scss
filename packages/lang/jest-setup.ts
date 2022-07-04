import { LexingResultSerializer, ChevTokenSerializer } from "@sassy/testing";

expect.addSnapshotSerializer(new LexingResultSerializer());
expect.addSnapshotSerializer(new ChevTokenSerializer());
