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

        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        }

        return url;
    }

    buildHeaders() {
        const headers = {
            "Content-Type": "application/json",
            "X-API-Key": this.apiKey
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(method, path, options = {}) {
        const {
            params = {},
            body = undefined
        } = options;

        const url = this.buildUrl(path, params);
        const headers = this.buildHeaders();

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