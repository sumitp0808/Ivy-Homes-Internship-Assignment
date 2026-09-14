import fs from "fs/promises";
import path from "path";

const INPUT_FILE = path.resolve(
    "investigation/data/raw/projects.json"
);

async function analyzeQ7() {
    const projects = JSON.parse(
        await fs.readFile(INPUT_FILE, "utf8")
    );


    const validProjects = projects.filter((project) => Number.isFinite(Number(project.price_max)));

    const costliest = validProjects.reduce((max, project) => Number(project.price_max) > Number(max.price_max)? project: max);

    const priceMaxCrore = Number(costliest.price_max);

    const priceMaxInr = priceMaxCrore * 10_000_000;

    console.log(priceMaxInr);
    console.log("========== Q7 ==========\n");

    console.log("\nCostliest project:");
    console.log(costliest);
}

analyzeQ7().catch((error) => {
    console.error(error.message);
    process.exit(1);
});