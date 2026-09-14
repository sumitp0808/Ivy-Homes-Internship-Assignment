import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
    getListing,
    getSimilarListings,
} from "../services/api";

import {
    getSavedListings,
    saveListing,
    removeSavedListing,
} from "../services/saved";

function formatPrice(price) {
    if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`;
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function ListingDetail({ user }) {
    const { id } = useParams();

    const [listing, setListing] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [saved, setSaved] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");

            try {
                /*
                 * Listing is the primary resource.
                 * If it fails, the page cannot be displayed.
                 */
                const listingData = await getListing(id);

                if (cancelled) {
                    return;
                }

                setListing(listingData);

                /*
                 * Saved state comes from local storage.
                 * It is scoped to the authenticated user.
                 */
                if (user?.email) {
                    const savedListings =
                        getSavedListings(user.email);

                    setSaved(
                        savedListings.some(
                            (item) =>
                                item.listing_id === id
                        )
                    );
                }

                /*
                 * Similar listings are optional.
                 * If this endpoint fails, the main listing
                 * should still remain usable.
                 */
                try {
                    const similarData =
                        await getSimilarListings(id);

                    if (!cancelled) {
                        setSimilar(
                            similarData?.results || []
                        );
                    }
                } catch {
                    if (!cancelled) {
                        setSimilar([]);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message ||
                            "Failed to load listing."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [id, user?.email]);

    function toggleSave() {
        if (!user?.email || !listing) {
            return;
        }

        setSaveError("");

        try {
            if (saved) {
                removeSavedListing(
                    user.email,
                    listing.listing_id
                );

                setSaved(false);
            } else {
                saveListing(
                    user.email,
                    listing
                );

                setSaved(true);
            }
        } catch {
            setSaveError(
                "Unable to update saved listings."
            );
        }
    }

    if (loading) {
        return (
            <div className="p-10">
                Loading listing...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                {error}
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
                Listing not found.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            <Link
                to="/listings"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
                ← Back to listings
            </Link>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                {/* Header */}
                <div className="border-b border-zinc-200 p-6 lg:p-8">
                    <div className="flex flex-col justify-between gap-5 md:flex-row">
                        <div>
                            <div className="mb-2 text-xs uppercase tracking-wider text-zinc-400">
                                {listing.website}
                            </div>

                            <h1 className="text-2xl font-bold text-zinc-900">
                                {listing.apartment_name}
                            </h1>

                            <p className="mt-2 capitalize text-zinc-500">
                                {listing.locality}
                            </p>
                        </div>

                        <button
                            onClick={toggleSave}
                            className={`rounded-lg px-5 py-3 text-sm font-semibold ${
                                saved
                                    ? "bg-zinc-900 text-white"
                                    : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                            }`}
                        >
                            {saved
                                ? "♥ Saved"
                                : "♡ Save listing"}
                        </button>
                    </div>

                    {saveError && (
                        <p className="mt-3 text-sm text-red-600">
                            {saveError}
                        </p>
                    )}
                </div>

                {/* Property information */}
                <div className="grid gap-8 p-6 md:grid-cols-2 lg:p-8">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Property
                        </h2>

                        <div className="mt-4 grid grid-cols-2 gap-y-5">
                            <Info
                                label="Price"
                                value={formatPrice(
                                    listing.price
                                )}
                            />

                            <Info
                                label="Carpet area"
                                value={`${Number(
                                    listing.carpet_area
                                ).toLocaleString(
                                    "en-IN"
                                )} sqft`}
                            />

                            <Info
                                label="Super built-up"
                                value={`${Number(
                                    listing.super_built_up_area
                                ).toLocaleString(
                                    "en-IN"
                                )} sqft`}
                            />

                            <Info
                                label="Bedrooms"
                                value={`${listing.bedroom} BHK`}
                            />

                            <Info
                                label="Bathrooms"
                                value={listing.bathroom}
                            />

                            <Info
                                label="Balcony"
                                value={listing.balcony}
                            />

                            <Info
                                label="Floor"
                                value={`${listing.floor} / ${listing.total_floors}`}
                            />

                            <Info
                                label="Furnishing"
                                value={listing.furnishing}
                            />

                            <Info
                                label="Facing"
                                value={listing.facing_direction}
                            />

                            <Info
                                label="Parking"
                                value={listing.covered_parking}
                            />
                        </div>
                    </div>

                    {/* Listing information */}
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Listing
                        </h2>

                        <div className="mt-4 space-y-5">
                            <Info
                                label="Listing ID"
                                value={listing.listing_id}
                            />

                            <Info
                                label="Posted by"
                                value={listing.posted_by}
                            />

                            <Info
                                label="Posted at"
                                value={new Date(
                                    listing.posted_at
                                ).toLocaleString("en-IN")}
                            />

                            <Info
                                label="Verified"
                                value={
                                    listing.is_verified
                                        ? "Yes"
                                        : "No"
                                }
                            />

                            <Info
                                label="Live"
                                value={
                                    listing.is_live
                                        ? "Yes"
                                        : "No"
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="border-t border-zinc-200 p-6 lg:p-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                        Description
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-700">
                        {listing.description}
                    </p>
                </div>
            </div>

            {/* Similar listings */}
            {similar.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-bold text-zinc-900">
                        Similar listings
                    </h2>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {similar.slice(0, 4).map((item) => (
                            <Link
                                key={item.listing_id}
                                to={`/listings/${encodeURIComponent(
                                    item.listing_id
                                )}`}
                                className="rounded-xl border border-zinc-200 bg-white p-5 hover:shadow-sm"
                            >
                                <div className="font-semibold text-zinc-900">
                                    {item.apartment_name}
                                </div>

                                <div className="mt-1 text-sm text-zinc-500">
                                    {item.bedroom} BHK ·{" "}
                                    {formatPrice(
                                        item.price
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <div className="text-xs text-zinc-400">
                {label}
            </div>

            <div className="mt-1 font-medium capitalize text-zinc-800">
                {value}
            </div>
        </div>
    );
}