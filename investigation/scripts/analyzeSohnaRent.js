import fs from "fs/promises";
import path from "path";

const INPUT_FILE = path.resolve(
    "investigation/data/raw/rentals.json"
);

async function analyzeSohnaRoadRent() {
    const rentals = JSON.parse(
        await fs.readFile(INPUT_FILE, "utf8")
    );

    const sohnaRoadRentals = rentals.filter((listing) => listing.locality?.trim().toLowerCase() === "sohna road");

    const totalMonthlyRent = sohnaRoadRentals.reduce((sum, listing) => sum + Number(listing.price), 0);

    console.log("Total rental records:", rentals.length);
    console.log("Sohna Road rental records:", sohnaRoadRentals.length);
    console.log("Total monthly rent:", totalMonthlyRent);
    console.log("Total monthly rent (₹):", totalMonthlyRent.toLocaleString("en-IN"));
 
    console.log("\nSohna Road listings:");

    for (const listing of sohnaRoadRentals) {
        console.log(
            listing.listing_id,
            "|",
            listing.price,
            "|",
            listing.apartment_name
        );
    }
}

analyzeSohnaRoadRent().catch((error) => {
    console.error(error.message);
    process.exit(1);
});