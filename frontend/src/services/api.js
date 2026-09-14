const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://solve.ivy.homes";

const API_KEY = import.meta.env.VITE_API_KEY;

const SESSION_KEY = "ivy_session";

/* =========================
   SESSION STORAGE
========================= */

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

/* =========================
   REQUEST HELPERS
========================= */

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
   TOKEN REFRESH
========================= */

/*
 * The running API issues:
 *
 * access_token  -> short-lived
 * refresh_token -> used to obtain a new access token
 *
 * Therefore a 401 should first attempt a refresh
 * before forcing the user to log in again.
 */
async function refreshAccessToken() {
    const session = getSession();

    if (!session?.refresh_token) {
        return false;
    }

    try {
        const response = await fetch(
            buildUrl("/auth/refresh"),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY,
                },
                body: JSON.stringify({
                    refresh_token:
                        session.refresh_token,
                }),
            }
        );

        if (!response.ok) {
            clearSession();
            return false;
        }

        const data = await response.json();

        if (!data?.access_token) {
            clearSession();
            return false;
        }

        /*
         * Keep the existing refresh token/user information
         * if the refresh endpoint doesn't return them again.
         */
        const updatedSession = {
            ...session,
            ...data,
            refresh_token:
                data.refresh_token ||
                session.refresh_token,
            user:
                data.user ||
                session.user,
        };

        saveSession(updatedSession);

        return true;
    } catch {
        clearSession();
        return false;
    }
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
    options = {},
    allowRefresh = true
) {
    const response = await fetch(
        buildUrl(
            path,
            options.params || {}
        ),
        {
            ...options,
            headers: {
                ...buildHeaders(),
                ...(options.headers || {}),
            },
        }
    );

    /*
     * Access token expired.
     *
     * Try exactly one refresh, then retry the
     * original request once.
     */
    if (
        response.status === 401 &&
        allowRefresh
    ) {
        const refreshed =
            await refreshAccessToken();

        if (refreshed) {
            return request(
                path,
                options,
                false
            );
        }

        clearSession();
    }

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

export async function getRental(id) {
    return request(
        `/v1/rentals/${encodeURIComponent(id)}`,
        {
            method: "GET",
        }
    );
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
   ANALYTICS
========================= */

export async function getAnalytics() {
    return request("/v1/analytics/summary", {
        method: "GET",
    });
}

