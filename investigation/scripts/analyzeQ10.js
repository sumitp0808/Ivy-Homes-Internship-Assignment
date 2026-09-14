import fs from "fs/promises";
import path from "path";

const LISTINGS_FILE = path.resolve(
    "investigation/data/raw/listings.json"
);

const PROJECTS_FILE = path.resolve(
    "investigation/data/raw/projects.json"
);

async function loadJson(filePath) {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
}

async function main() {
    const listings = await loadJson(LISTINGS_FILE);
    const projects = await loadJson(PROJECTS_FILE);

    // 1. Count actual listings belonging to each project

    const actualCounts = new Map();

    for (const listing of listings) {
        const projectId = listing.project_id;

        if (!projectId) {
            continue;
        }

        actualCounts.set(
            projectId,
            (actualCounts.get(projectId) || 0) + 1
        );
    }

    // 2. Compare project's reported total_listings
    //    against the actual listing count

    const wrongProjects = [];

    for (const project of projects) {
        const projectId = project.project_id;

        const reportedCount = project.total_listings;

        const actualCount =
            actualCounts.get(projectId) || 0;

        if (reportedCount !== actualCount) {
            wrongProjects.push({
                project_id: projectId,
                reported: reportedCount,
                actual: actualCount
            });
        }
    }

    // 3. Sort by project_id for reproducible output

    wrongProjects.sort((a, b) =>
        a.project_id.localeCompare(b.project_id)
    );

    // 4. Print result

    console.log("projects_with_wrong_listing_count:", wrongProjects.length);

    // 5. Save evidence

    // const outputFile = path.resolve(
    //     "investigation/data/q10_wrong_projects.json"
    // );

    // await fs.writeFile(
    //     outputFile,
    //     JSON.stringify(wrongProjects, null, 2),
    //     "utf8"
    // );
}

main().catch((error) => {
    console.error("\nQ10 analysis failed:");
    console.error(error.message);
    process.exit(1);
});