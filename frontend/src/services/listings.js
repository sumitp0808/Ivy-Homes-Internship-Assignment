import { getListings } from "./api";

const PAGE_SIZE = 50;

/*
 * The running API exposes GET /v1/listings but does not expose
 * the documented individual listing endpoint.
 *
 * Therefore this service provides collection-based lookup.
 */

let listingsCache = null;
let listingsPromise = null;

export async function getAllListings(forceRefresh = false) {
    if (listingsCache && !forceRefresh) {
        return listingsCache;
    }

    if (listingsPromise && !forceRefresh) {
        return listingsPromise;
    }

    listingsPromise = (async () => {
        const collected = [];
        let offset = 0;

        while (true) {
            const response = await getListings({
                limit: PAGE_SIZE,
                offset,
            });

            const results = response?.results || [];

            collected.push(...results);

            if (
                results.length === 0 ||
                results.length < PAGE_SIZE ||
                response?.has_more === false
            ) {
                break;
            }

            offset += results.length;
        }

        listingsCache = collected;

        return collected;
    })();

    try {
        return await listingsPromise;
    } finally {
        listingsPromise = null;
    }
}

/*
 * Local replacement for the unavailable
 * GET /v1/listings/{listing_id}/similar endpoint.
 *
 * Similarity is based on:
 * 1. Same locality
 * 2. Same bedroom count
 * 3. Similar carpet area
 * 4. Similar price
 */

export function getSimilarListingsFromCollection(
    listing,
    listings,
    limit = 4
) {
    if (!listing || !Array.isArray(listings)) {
        return [];
    }

    const targetArea = Number(listing.carpet_area) || 0;
    const targetPrice = Number(listing.price) || 0;

    const scored = listings
        .filter(
            (item) =>
                item.listing_id !== listing.listing_id
        )
        .map((item) => {
            let score = 0;

            const sameLocality =
                item.locality &&
                listing.locality &&
                item.locality.toLowerCase() ===
                    listing.locality.toLowerCase();

            const sameBedrooms =
                Number(item.bedroom) ===
                Number(listing.bedroom);

            if (sameLocality) {
                score += 40;
            }

            if (sameBedrooms) {
                score += 30;
            }

            const itemArea =
                Number(item.carpet_area) || 0;

            const itemPrice =
                Number(item.price) || 0;

            if (targetArea > 0 && itemArea > 0) {
                const areaDifference =
                    Math.abs(itemArea - targetArea) /
                    targetArea;

                score += Math.max(
                    0,
                    20 - areaDifference * 20
                );
            }

            if (targetPrice > 0 && itemPrice > 0) {
                const priceDifference =
                    Math.abs(itemPrice - targetPrice) /
                    targetPrice;

                score += Math.max(
                    0,
                    10 - priceDifference * 10
                );
            }

            return {
                listing: item,
                score,
            };
        })
        .sort((a, b) => b.score - a.score);

    return scored
        .slice(0, limit)
        .map((item) => item.listing);
}

export function clearListingsCache() {
    listingsCache = null;
}