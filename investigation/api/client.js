import { config } from "../config/config.js";

export class ApiClient {
    constructor() {
        this.baseUrl = config.baseUrl;
        this.apiKey = config.apiKey;
        this.token = null;
    }

    setToken(token) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    buildUrl(path, params = {}) {
        const url = new URL(path, this.baseUrl);

        // Every API request uses our API key.
        url.searchParams.set("api_key", this.apiKey);

        // Add endpoint-specific query parameters.
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        }

        return url;
    }

    async request(method, path, options = {}) {
        const {
            params = {},
            body = undefined
        } = options;

        const url = this.buildUrl(path, params);

        const headers = {
            "Content-Type": "application/json"
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body !== undefined
                ? JSON.stringify(body)
                : undefined
        });

        let responseBody;

        try {
            responseBody = await response.json();
        } catch {
            responseBody = null;
        }

        if (!response.ok) {
            const detail =
                responseBody?.detail ||
                `HTTP ${response.status}`;

            throw new Error(
                `${method} ${path} failed (${response.status}): ${detail}`
            );
        }

        return responseBody;
    }

    async get(path, params = {}) {
        return this.request("GET", path, { params });
    }

    async post(path, body = {}, params = {}) {
        return this.request("POST", path, {
            params,
            body
        });
    }

    async delete(path, params = {}) {
        return this.request("DELETE", path, { params });
    }
}