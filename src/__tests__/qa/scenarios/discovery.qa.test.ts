import { describe, it, beforeEach, vi } from "vitest";
import { runApiTest } from "@/test/api-helpers";
import { discoveryTests } from "../fixtures/api-test-data";

describe("[Discovery] TC-STR-011 ~ 018 + Errors", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    discoveryTests.forEach(tc => {
        it(`${tc.id}: ${tc.description}`, async () => {
            await runApiTest(tc);
        });
    });
});
