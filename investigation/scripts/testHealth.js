import { getHealth } from "../api/client.js";

try {
    const health = await getHealth();

    console.log("Health response:");
    console.dir(health, { depth: null });
} catch (error) {
    console.error("Health check failed:");
    console.error(error.message);
}