import fs from "fs/promises";

const listings = JSON.parse(
    await fs.readFile("investigation/data/raw/listings.json", "utf8")
);


export function findCorruptListings(listings) {
    const corrupt = listings.filter((listing) =>
        listing.price <= 0 ||
        listing.carpet_area <= 0 ||
        listing.super_built_up_area <= 0 ||
        listing.carpet_area > listing.super_built_up_area ||
        listing.floor > listing.total_floors ||
        listing.total_floors <= 0
    );

    const corruptIds = corrupt
    .map((listing) => listing.listing_id)
    .sort();

    return corruptIds;
}