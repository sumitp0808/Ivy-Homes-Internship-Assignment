const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://solve.ivy.homes";

const API_KEY = import.meta.env.VITE_API_KEY;

const SESSION_KEY = "ivy_session";

function getSession() {
    try {
        return JSON.parse(
            localStorage.getItem(SESSION_KEY) || "null"
        );
    } catch {
        return null;
    }
}

function saveSession(session) {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );
}

export function getStoredSession() {
    return getSession();
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function buildHeaders() {
    const session = getSession();

    const headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
    };

    if (session?.access_token) {
        headers.Authorization =
            `Bearer ${session.access_token}`;
    }

    return headers;
}

function buildUrl(path, params = {}) {
    const url = new URL(
        path,
        API_BASE_URL.endsWith("/")
            ? API_BASE_URL
            : `${API_BASE_URL}/`
    );

    for (const [key, value] of Object.entries(params)) {
        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            url.searchParams.set(key, value);
        }
    }

    return url;
}

async function parseResponse(response) {
    let body = null;

    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const error = new Error(
            body?.detail ||
            body?.message ||
            `HTTP ${response.status}`
        );

        error.status = response.status;
        error.body = body;

        throw error;
    }

    return body;
}

/* =========================
   AUTH
========================= */

export async function login(email, password) {
    const response = await fetch(
        buildUrl("/auth/login"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY,
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    const data = await parseResponse(response);

    if (!data.access_token) {
        throw new Error(
            "Login succeeded but no access_token was returned."
        );
    }

    saveSession(data);

    return data;
}

export async function logout() {
    const session = getSession();

    try {
        if (session?.access_token) {
            await fetch(
                buildUrl("/auth/logout"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": API_KEY,
                        Authorization:
                            `Bearer ${session.access_token}`,
                    },
                }
            );
        }
    } finally {
        clearSession();
    }
}

/* =========================
   GENERIC REQUEST
========================= */

async function request(
    path,
    options = {}
) {
    const response = await fetch(
        buildUrl(path, options.params || {}),
        {
            ...options,
            headers: {
                ...buildHeaders(),
                ...(options.headers || {}),
            },
        }
    );

    return parseResponse(response);
}

/* =========================
   LISTINGS
========================= */

export async function getListings(params = {}) {
    return request("/v1/listings", {
        method: "GET",
        params,
    });
}

export async function getListing(id) {
    return request(
        `/v1/listing/${encodeURIComponent(id)}`,
        {
            method: "GET",
        }
    );
}

export async function getSimilarListings(id) {
    return request(
        `/v1/listing/${encodeURIComponent(id)}/similar`,
        {
            method: "GET",
        }
    );
}

/* =========================
   RENTALS
========================= */

export async function getRentals(params = {}) {
    return request("/v1/rentals", {
        method: "GET",
        params,
    });
}

/* =========================
   PROJECTS
========================= */

export async function getProjects(params = {}) {
    return request("/v1/projects", {
        method: "GET",
        params,
    });
}

export async function getProject(id) {
    return request(
        `/v1/projects/${encodeURIComponent(id)}`,
        {
            method: "GET",
        }
    );
}

/* =========================
   FAVOURITES
========================= */

export async function getFavourites() {
    return request("/v1/favourites", {
        method: "GET",
    });
}

export async function addFavourite(listingId) {
    return request("/v1/favourites", {
        method: "POST",
        body: JSON.stringify({
            id: listingId,
        }),
    });
}

export async function removeFavourite(listingId) {
    return request(
        `/v1/favourites/${encodeURIComponent(listingId)}`,
        {
            method: "DELETE",
        }
    );
}

/* =========================
   ANALYTICS
========================= */

export async function getAnalytics() {
    return request("/v1/analytics/summary", {
        method: "GET",
    });
}