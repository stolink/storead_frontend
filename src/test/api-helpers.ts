import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { expect } from "vitest";

export interface ApiTestCase {
  id: string;
  description: string;
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  url: string;
  requestUrl?: string;
  requestBody?: unknown;
  mockResponse: {
    status?: number;
    body?: unknown;
  };
  expectedStatus?: number;
  verify?: (json: unknown) => void;
}

export const runApiTest = async (tc: ApiTestCase) => {
  const API_URL = "/api";
  const methodKey = tc.method.toLowerCase() as
    | "get"
    | "post"
    | "patch"
    | "delete"
    | "put";
  const httpMethod = http[methodKey];

  const handler = httpMethod(`${API_URL}${tc.url}`, async () => {
    return HttpResponse.json(tc.mockResponse.body as any, {
      status: tc.mockResponse.status || 200,
    });
  });
  server.use(handler);

  const endpoint = tc.requestUrl || tc.url;
  const fetchUrl = `${API_URL}${endpoint}`;

  const options: RequestInit = {
    method: tc.method,
    headers: tc.requestBody
      ? { "Content-Type": "application/json" }
      : undefined,
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
