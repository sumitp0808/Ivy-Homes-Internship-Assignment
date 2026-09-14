import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

const client = new ApiClient();

async function inspectRentals() {
    await login(client);

    const response = await client.get("/v1/rentals", {
        page: 1,
        limit: 5
    });

    console.dir(response, { depth: null });
}

inspectRentals().catch((error) => {
    console.error(error.message);
    process.exit(1);
});