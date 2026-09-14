import fs from "fs/promises";
import path from "path";

const INPUT_FILE = path.resolve(
    "investigation/data/raw/listings.json"
);

function isCorrupt(listing) {
    return (
        listing.price <= 0 ||
        listing.carpet_area <= 0 ||
        listing.super_built_up_area <= 0 ||
        listing.carpet_area > listing.super_built_up_area ||
        listing.floor > listing.total_floors ||
        listing.total_floors <= 0
    );
}

const fakeListingIds = new Set([
    "100-6000578",
    "100-6000678",
    "100-6001599",
    "MAG-6002472",
    "MAG-6002941",
    "SQU-6000395"
]);

async function analyzeQ6() {
    const listings = JSON.parse(
        await fs.readFile(INPUT_FILE, "utf8")
    );


    const eligible = listings.filter((listing) =>
        listing.is_live === true &&
        Number(listing.bedroom) === 2 &&
        !isCorrupt(listing) &&
        !fakeListingIds.has(listing.listing_id)
    );

    const results = eligible.map((listing) => ({
        listing_id: listing.listing_id,
        price: Number(listing.price),
        carpet_area: Number(listing.carpet_area),
        price_per_sqft:
            Number(listing.price) /
            Number(listing.carpet_area)
    }));

    // Step 4: arithmetic mean
    const sum = results.reduce((total, listing) => total + listing.price_per_sqft,0);

    const average = sum / results.length;

    console.log("========== Q6 ==========\n");

    console.log("Total listings:", listings.length);


    console.log(
        "Eligible listings:",
        results.length
    );

    console.log(
        "Sum of individual price/sqft:",
        sum
    );

    console.log(
        "Average price/sqft:",
        average
    );

    console.log(
        "Rounded answer:",
        average.toFixed(2)
    );

}

analyzeQ6().catch((error) => {
    console.error(error.message);
    process.exit(1);
});