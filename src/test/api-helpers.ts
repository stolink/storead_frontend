import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { expect } from "vitest";

export interface ApiTestCase {
    id: string;
    description: string;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
    url: string;
    requestUrl?: string;
    requestBody?: any;
    mockResponse: {
        status?: number;
        body?: any;
    };
    expectedStatus?: number;
    verify?: (json: any) => void;
}

export const runApiTest = async (tc: ApiTestCase) => {
    const API_URL = "/api";
    const method = tc.method.toLowerCase() as keyof typeof http;

    if (typeof http[method] !== 'function') {
        throw new Error(`Unsupported method: ${tc.method}`);
    }

    const handler = (http[method] as any)(`${API_URL}${tc.url}`, async () => {
        return HttpResponse.json(tc.mockResponse.body, { status: tc.mockResponse.status || 200 });
    });
    server.use(handler);

    const endpoint = tc.requestUrl || tc.url;
    const fetchUrl = `${API_URL}${endpoint}`;

    const options: RequestInit = {
        method: tc.method,
        headers: tc.requestBody ? { "Content-Type": "application/json" } : undefined,
        body: tc.requestBody ? JSON.stringify(tc.requestBody) : undefined,
    };

    const res = await fetch(fetchUrl, options);

    expect(res.status).toBe(tc.expectedStatus || 200);

    if (tc.verify || tc.mockResponse.body) {
        const text = await res.text();
        if (text) {
            const json = JSON.parse(text);
            if (tc.verify) {
                tc.verify(json);
            }
        }
    }
};
