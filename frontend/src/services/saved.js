const STORAGE_PREFIX = "ivy_saved_";

function getStorageKey(email) {
    return `${STORAGE_PREFIX}${email}`;
}

function readSaved(email) {
    if (!email) return [];

    try {
        const raw = localStorage.getItem(getStorageKey(email));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeSaved(email, listings) {
    if (!email) return;

    localStorage.setItem(
        getStorageKey(email),
        JSON.stringify(listings)
    );
}

export function getSavedListings(email) {
    return readSaved(email);
}

export function isListingSaved(email, listingId) {
    return readSaved(email).some(
        (listing) => listing.listing_id === listingId
    );
}

export function saveListing(email, listing) {
    const current = readSaved(email);

    const alreadySaved = current.some(
        (item) => item.listing_id === listing.listing_id
    );

    if (alreadySaved) {
        return current;
    }

    const updated = [...current, listing];
    writeSaved(email, updated);

    return updated;
}

export function removeSavedListing(email, listingId) {
    const current = readSaved(email);

    const updated = current.filter(
        (listing) => listing.listing_id !== listingId
    );

    writeSaved(email, updated);

    return updated;
}