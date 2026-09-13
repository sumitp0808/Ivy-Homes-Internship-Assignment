import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

const client = new ApiClient();

try {
    const response = await login(client);

    console.log("Login successful.");
    console.log("Token received:", Boolean(response.token));
    console.log("Token type:", response.token_type);
    console.log("Expires in:", response.expires_in);
    console.log("User:", response.user);

} catch (error) {
    console.error("Login failed:");
    console.error(error.message);
}