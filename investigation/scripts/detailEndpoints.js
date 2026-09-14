import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "../data/raw");

function loadJson(filename) {
    const filePath = path.join(dataDir, filename);

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Missing ${filename}. Expected it at ${filePath}`
        );
    }

    return JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );
}

async function testEndpoint(
    client,
    label,
    path,
    expectedDescription
) {
    console.log(`\n${label}`);
    console.log(`Path: ${path}`);

    try {
        const response = await client.get(path);

        console.log("STATUS: SUCCESS");
        console.log(
            `Expected: ${expectedDescription}`
        );

        if (Array.isArray(response)) {
            console.log(
                `Returned array with ${response.length} records`
            );
        } else if (response && typeof response === "object") {
            console.log(
                "Returned object keys:",
                Object.keys(response)
            );
        } else {
            console.log("Returned:", response);
        }

        return {
            status: "success",
            httpStatus: 200,
            path,
            response,
        };
    } catch (error) {
        console.log("STATUS: FAILED");
        console.log("HTTP status:", error.status);
        console.log("Message:", error.message);

        return {
            status: "failed",
            httpStatus: error.status,
            path,
            error: error.message,
        };
    }
}

async function main() {
    console.log("========================================");
    console.log("DETAIL ENDPOINT INVESTIGATION");
    console.log("========================================");

    /*
     * Load known valid records from the
     * downloaded API datasets.
     */
    const listings = loadJson("listings.json");
    const rentals = loadJson("rentals.json");
    const projects = loadJson("projects.json");

    if (!listings.length) {
        throw new Error("listings.json is empty.");
    }

    if (!rentals.length) {
        throw new Error("rentals.json is empty.");
    }

    if (!projects.length) {
        throw new Error("projects.json is empty.");
    }

    const listingId = listings[0].listing_id;
    const rentalId = rentals[0].listing_id;
    const projectId = projects[0].project_id;

    console.log("\nKnown test records:");
    console.log("Listing ID:", listingId);
    console.log("Rental ID:", rentalId);
    console.log("Project ID:", projectId);

    /*
     * Authenticate first.
     */
    const client = new ApiClient();

    console.log("\nLogging in...");

    const auth = await login(client);

    console.log(
        "Login successful:",
        auth.user?.email
    );

    /*
     * Test documented endpoints exactly as written.
     */
    const results = [];

    results.push(
        await testEndpoint(
            client,
            "1. Single listing",
            `/v1/listing/${encodeURIComponent(
                listingId
            )}`,
            "Single listing object"
        )
    );

    results.push(
        await testEndpoint(
            client,
            "2. Similar listings",
            `/v1/listings/${encodeURIComponent(
                listingId
            )}/similar`,
            "Up to ten comparable listings"
        )
    );

    results.push(
        await testEndpoint(
            client,
            "3. Single rental",
            `/v1/rentals/${encodeURIComponent(
                rentalId
            )}`,
            "Single rental object"
        )
    );

    results.push(
        await testEndpoint(
            client,
            "4. Single project",
            `/v1/projects/${encodeURIComponent(
                projectId
            )}`,
            "Single project object"
        )
    );

    /*
     * If a documented endpoint fails, test likely
     * singular/plural alternatives so we can discover
     * whether the route was documented incorrectly.
     */
    console.log("\n========================================");
    console.log("ALTERNATIVE PATH CHECKS");
    console.log("========================================");

    const alternatives = [];

    alternatives.push(
        await testEndpoint(
            client,
            "5. Alternative similar path",
            `/v1/listing/${encodeURIComponent(
                listingId
            )}/similar`,
            "Possible singular alternative"
        )
    );

    alternatives.push(
        await testEndpoint(
            client,
            "6. Alternative rental path",
            `/v1/rental/${encodeURIComponent(
                rentalId
            )}`,
            "Possible singular alternative"
        )
    );

    alternatives.push(
        await testEndpoint(
            client,
            "7. Alternative project path",
            `/v1/project/${encodeURIComponent(
                projectId
            )}`,
            "Possible singular alternative"
        )
    );

    /*
     * Summary
     */
    console.log("\n========================================");
    console.log("SUMMARY");
    console.log("========================================");

    for (const result of [
        ...results,
        ...alternatives,
    ]) {
        console.log(
            `${result.status.toUpperCase().padEnd(7)} ` +
            `${String(result.httpStatus).padEnd(4)} ` +
            result.path
        );
    }

    /*
     * Identify documented endpoints that returned 404.
     */
    const documented404s = results.filter(
        (result) => result.httpStatus === 404
    );

    if (documented404s.length > 0) {
        console.log("\n========================================");
        console.log("DOCUMENTED ENDPOINTS RETURNING 404");
        console.log("========================================");

        for (const result of documented404s) {
            console.log(result.path);
        }

        console.log(
            "\nThese should be recorded as " +
            "`missing_endpoint` findings only after " +
            "reproducing the result."
        );
    }
}

main().catch((error) => {
    console.error("\nInvestigation failed:");
    console.error(error.message);
    process.exit(1);
});