import { LexResultSerializer, TokenSerializer } from "@sassy/testing";

expect.addSnapshotSerializer(new LexResultSerializer());
expect.addSnapshotSerializer(new TokenSerializer());
