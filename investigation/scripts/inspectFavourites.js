import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

async function main() {
    const client = new ApiClient();

    console.log("Logging in...");
    const auth = await login(client);

    console.log("Login successful:", auth.user?.email);
    console.log("Token received:", Boolean(auth.access_token));

    // -----------------------------------------
    // GET /v1/favourites
    // -----------------------------------------

    console.log("\n1. GET /v1/favourites");

    try {
        const response = await client.get("/v1/favourites");

        console.log("STATUS: SUCCESS");
        console.dir(response, { depth: null });
    } catch (error) {
        console.log("STATUS: FAILED");
        console.log(error.message);
    }

    // -----------------------------------------
    // POST /v1/favourites
    // -----------------------------------------

    console.log("\n2. POST /v1/favourites");

    try {
        const response = await client.post(
            "/v1/favourites",
            {
                id: "100-6001497"
            }
        );

        console.log("STATUS: SUCCESS");
        console.dir(response, { depth: null });
    } catch (error) {
        console.log("STATUS: FAILED");
        console.log(error.message);
    }

    // -----------------------------------------
    // GET again
    // -----------------------------------------

    console.log("\n3. GET /v1/favourites after POST");

    try {
        const response = await client.get("/v1/favourites");

        console.log("STATUS: SUCCESS");
        console.dir(response, { depth: null });
    } catch (error) {
        console.log("STATUS: FAILED");
        console.log(error.message);
    }

    // -----------------------------------------
    // DELETE
    // -----------------------------------------

    console.log("\n4. DELETE /v1/favourites/100-6001497");

    try {
        const response = await client.delete(
            "/v1/favourites/100-6001497"
        );

        console.log("STATUS: SUCCESS");
        console.dir(response, { depth: null });
    } catch (error) {
        console.log("STATUS: FAILED");
        console.log(error.message);
    }
}

main().catch((error) => {
    console.error("\nTest failed:");
    console.error(error);
    process.exit(1);
});