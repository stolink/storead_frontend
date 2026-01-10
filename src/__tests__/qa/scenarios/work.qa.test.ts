import { describe, it, beforeEach, vi } from "vitest";
import { runApiTest } from "@/test/api-helpers";
import { workTests } from "../fixtures/api-test-data";

describe("[Work/Viewer] TC-STR-019 ~ 025 + Errors", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    workTests.forEach(tc => {
        it(`${tc.id}: ${tc.description}`, async () => {
            await runApiTest(tc);
        });
    });
});
