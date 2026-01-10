import { describe, it, beforeEach, vi } from "vitest";
import { runApiTest } from "@/test/api-helpers";
import { libraryTests, socialTests, paymentTests, miscTests } from "../fixtures/api-test-data";

describe("General Storead API Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("[Library] TC-STR-026 ~ 031", () => {
        libraryTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });

    describe("[Social] TC-STR-032 ~ 041", () => {
        socialTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });

    describe("[Payment] TC-STR-042 ~ 056", () => {
        paymentTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });

    describe("[Misc] TC-STR-057 ~ 061", () => {
        miscTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });
});
