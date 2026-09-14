import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

const client = new ApiClient();

try {
    await login(client);

    const page = await client.get("/v1/listings", {
    limit: 1,
    offset: 3499
    });

    console.log(page);

} catch (error) {
    console.error("Pagination test failed:");
    console.error(error.message);
}