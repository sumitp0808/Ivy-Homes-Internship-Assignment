import fs from "fs/promises";
const start = new Date("2026-09-03T00:00:00+05:30");
const end = new Date("2026-09-10T00:00:00+05:30");

const listings = JSON.parse(
    await fs.readFile("investigation/data/raw/listings.json", "utf8")
);

const recentListings = listings.filter((listing) => {
    const postedAt = new Date(listing.posted_at);

    return postedAt >= start && postedAt < end;
});

console.log("Q8 count:", recentListings.length);