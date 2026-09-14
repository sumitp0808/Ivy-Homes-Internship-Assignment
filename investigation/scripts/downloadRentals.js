import fs from "fs/promises";
import path from "path";

import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

const client = new ApiClient();

const OUTPUT_DIR = path.resolve("investigation/data/raw");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "rentals.json");

const LIMIT = 100;

async function downloadRentals() {
    await login(client);

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const allRentals = [];
    let offset = 0;
    let requestNumber = 1;

    while (true) {
        console.log(
            `Request ${requestNumber}: offset=${offset}, limit=${LIMIT}`
        );

        const response = await client.get("/v1/rentals", {
            limit: LIMIT,
            offset
        });

        console.log(
            `  received=${response.results.length}, ` +
            `total=${response.total}, ` +
            `has_more=${response.has_more}`
        );

        if (response.results.length === 0) {
            break;
        }

        allRentals.push(...response.results);

        offset += response.results.length;
        requestNumber++;

        if (requestNumber > 100) {
            throw new Error("Pagination safety limit reached.");
        }
    }

    await fs.writeFile(
        OUTPUT_FILE,
        JSON.stringify(allRentals, null, 2),
        "utf8"
    );

    console.log("\nDownload complete.");
    console.log("Records downloaded:", allRentals.length);
    console.log("Saved to:", OUTPUT_FILE);
}

downloadRentals().catch((error) => {
    console.error("\nDownload failed:");
    console.error(error.message);
    process.exit(1);
});