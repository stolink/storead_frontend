import { describe, it, beforeEach, vi } from "vitest";
import { runApiTest } from "@/test/api-helpers";
import { authTests } from "../fixtures/api-test-data";

describe("[Auth/User] TC-STR-001 ~ 010 + Errors", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    authTests.forEach(tc => {
        it(`${tc.id}: ${tc.description}`, async () => {
            await runApiTest(tc);
        });
    });
});
