import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

const client = new ApiClient();

async function inspectProjects() {
    await login(client);

    const response = await client.get("/v1/projects", {
        page: 1,
        limit: 5
    });

    console.dir(response, { depth: null });
}

inspectProjects().catch((error) => {
    console.error(error.message);
    process.exit(1);
});