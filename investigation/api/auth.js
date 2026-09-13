import { config } from "../config/config.js";

export async function login(client) {
    const response = await client.post("/auth/login", {
        email: config.loginEmail,
        password: config.loginPassword
    });

    if (!response.token) {
        throw new Error("Login succeeded but no token was returned.");
    }

    client.setToken(response.token);

    return response;
}

export async function logout(client) {
    const response = await client.post("/auth/logout");

    client.clearToken();

    return response;
}