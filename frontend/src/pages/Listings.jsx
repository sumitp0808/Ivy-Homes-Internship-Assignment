import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
    getAllListings,
    getListingFromCollection,
    getSimilarListingsFromCollection,
} from "../services/listings";

import {
    getSavedListings,
    saveListing,
    removeSavedListing,
} from "../services/saved";

function formatPrice(price) {
    const value = Number(price);

    if (!Number.isFinite(value)) {
        return "Price unavailable";
    }

    if (value >= 10000000) {
        return `₹${(
            value / 10000000
        ).toFixed(2)} Cr`;
    }

    if (value >= 100000) {
        return `₹${(
            value / 100000
        ).toFixed(2)} L`;
    }

    return `₹${value.toLocaleString(
        "en-IN"
    )}`;
}

function formatValue(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "—";
    }

    return String(value);
}

export default function ListingDetail({
    user,
}) {
    const { id } = useParams();

    const [listing, setListing] =
        useState(null);

    const [similar, setSimilar] =
        useState([]);

    const [saved, setSaved] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [saveError, setSaveError] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");

            try {
                /*
                 * The running API does not expose
                 * GET /v1/listing/{id}.
                 *
                 * Therefore use the working
                 * /v1/listings collection.
                 */
                const allListings =
                    await getAllListings();

                if (cancelled) {
                    return;
                }

                const found =
                    allListings.find(
                        (item) =>
                            String(
                                item.listing_id
                            ) === String(id)
                    ) || null;

                if (!found) {
                    setListing(null);
                    setError(
                        "Listing not found."
                    );
                    return;
                }

                setListing(found);

                /*
                 * Similar listings are calculated locally
                 * because the running API does not expose
                 * the documented similar-listings endpoint.
                 */
                const similarListings =
                    getSimilarListingsFromCollection(
                        found,
                        allListings,
                        4
                    );

                setSimilar(
                    similarListings
                );

                if (user?.email) {
                    const savedListings =
                        getSavedListings(
                            user.email
                        );

                    setSaved(
                        savedListings.some(
                            (item) =>
                                String(
                                    item.listing_id
                                ) === String(id)
                        )
                    );
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
            <div className="mx-auto max-w-5xl">
                <div className="mb-5 h-4 w-32 animate-pulse rounded bg-zinc-200" />

                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <div className="space-y-4 border-b border-zinc-200 p-6 lg:p-8">
                        <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
                        <div className="h-8 w-72 animate-pulse rounded bg-zinc-200" />
                        <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
                    </div>

                    <div className="grid gap-8 p-6 md:grid-cols-2 lg:p-8">
                        <div className="space-y-6">
                            {Array.from({
                                length: 5,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-12 animate-pulse rounded bg-zinc-100"
                                />
                            ))}
                        </div>

                        <div className="space-y-6">
                            {Array.from({
                                length: 5,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-12 animate-pulse rounded bg-zinc-100"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="mx-auto max-w-5xl">
                <Link
                    to="/listings"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                >
                    ← Back to listings
                </Link>

                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6">
                    <h1 className="font-semibold text-red-900">
                        Listing unavailable
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error ||
                            "The requested listing could not be found."}
                    </p>

                    <Link
                        to="/listings"
                        className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        Browse listings
                    </Link>
                </div>
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
                {/* HEADER */}

                <div className="border-b border-zinc-200 p-6 lg:p-8">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                        <div>
                            <div className="mb-2 text-xs uppercase tracking-wider text-zinc-400">
                                {formatValue(
                                    listing.website
                                )}
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 lg:text-3xl">
                                {formatValue(
                                    listing.apartment_name
                                )}
                            </h1>

                            <p className="mt-2 capitalize text-zinc-500">
                                {formatValue(
                                    listing.locality
                                )}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {listing.is_verified && (
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                        Verified
                                    </span>
                                )}

                                {listing.is_live && (
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                        Live listing
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={
                                toggleSave
                            }
                            className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
                                saved
                                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
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

                {/* KEY METRICS */}

                <div className="grid border-b border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                        label="Price"
                        value={formatPrice(
                            listing.price
                        )}
                    />

                    <Metric
                        label="Carpet area"
                        value={`${Number(
                            listing.carpet_area || 0
                        ).toLocaleString(
                            "en-IN"
                        )} sqft`}
                    />

                    <Metric
                        label="Configuration"
                        value={`${formatValue(
                            listing.bedroom
                        )} BHK`}
                    />

                    <Metric
                        label="Price / sqft"
                        value={
                            Number(
                                listing.carpet_area
                            ) > 0
                                ? formatPrice(
                                      Number(
                                          listing.price
                                      ) /
                                          Number(
                                              listing.carpet_area
                                          )
                                  )
                                : "—"
                        }
                    />
                </div>

                {/* PROPERTY DETAILS */}

                <div className="grid gap-10 p-6 md:grid-cols-2 lg:p-8">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Property details
                        </h2>

                        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6">
                            <Info
                                label="Bedrooms"
                                value={`${formatValue(
                                    listing.bedroom
                                )} BHK`}
                            />

                            <Info
                                label="Bathrooms"
                                value={formatValue(
                                    listing.bathroom
                                )}
                            />

                            <Info
                                label="Balcony"
                                value={formatValue(
                                    listing.balcony
                                )}
                            />

                            <Info
                                label="Floor"
                                value={`${formatValue(
                                    listing.floor
                                )} / ${formatValue(
                                    listing.total_floors
                                )}`}
                            />

                            <Info
                                label="Carpet area"
                                value={`${Number(
                                    listing.carpet_area ||
                                        0
                                ).toLocaleString(
                                    "en-IN"
                                )} sqft`}
                            />

                            <Info
                                label="Super built-up"
                                value={`${Number(
                                    listing.super_built_up_area ||
                                        0
                                ).toLocaleString(
                                    "en-IN"
                                )} sqft`}
                            />

                            <Info
                                label="Furnishing"
                                value={formatValue(
                                    listing.furnishing
                                )}
                            />

                            <Info
                                label="Facing"
                                value={formatValue(
                                    listing.facing_direction
                                )}
                            />

                            <Info
                                label="Parking"
                                value={formatValue(
                                    listing.covered_parking
                                )}
                            />

                            <Info
                                label="Posted by"
                                value={formatValue(
                                    listing.posted_by
                                )}
                            />
                        </div>
                    </div>

                    {/* LISTING INFORMATION */}

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Listing information
                        </h2>

                        <div className="mt-5 space-y-6">
                            <Info
                                label="Listing ID"
                                value={
                                    listing.listing_id
                                }
                            />

                            <Info
                                label="Website"
                                value={
                                    listing.website
                                }
                            />

                            <Info
                                label="Apartment"
                                value={
                                    listing.apartment_name
                                }
                            />

                            <Info
                                label="Locality"
                                value={
                                    listing.locality
                                }
                            />

                            <Info
                                label="Posted at"
                                value={
                                    listing.posted_at
                                        ? new Date(
                                              listing.posted_at
                                          ).toLocaleString(
                                              "en-IN"
                                          )
                                        : "—"
                                }
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

                {/* DESCRIPTION */}

                {listing.description && (
                    <div className="border-t border-zinc-200 p-6 lg:p-8">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Description
                        </h2>

                        <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-700">
                            {listing.description}
                        </p>
                    </div>
                )}
            </div>

            {/* SIMILAR LISTINGS */}

            {similar.length > 0 && (
                <section className="mt-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            You may also like
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-zinc-900">
                            Similar listings
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Properties with similar location,
                            configuration, size and price.
                        </p>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {similar.map(
                            (item) => (
                                <Link
                                    key={
                                        item.listing_id
                                    }
                                    to={`/listings/${encodeURIComponent(
                                        item.listing_id
                                    )}`}
                                    className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700">
                                                {
                                                    item.apartment_name
                                                }
                                            </h3>

                                            <p className="mt-1 text-sm capitalize text-zinc-500">
                                                {
                                                    item.locality
                                                }
                                            </p>
                                        </div>

                                        {item.is_verified && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-5 grid grid-cols-3 gap-3">
                                        <div>
                                            <div className="text-xs text-zinc-400">
                                                Price
                                            </div>

                                            <div className="mt-1 text-sm font-semibold text-zinc-900">
                                                {formatPrice(
                                                    item.price
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-zinc-400">
                                                Area
                                            </div>

                                            <div className="mt-1 text-sm font-semibold text-zinc-900">
                                                {Number(
                                                    item.carpet_area ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}{" "}
                                                sqft
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-zinc-400">
                                                Type
                                            </div>

                                            <div className="mt-1 text-sm font-semibold text-zinc-900">
                                                {
                                                    item.bedroom
                                                }{" "}
                                                BHK
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

function Metric({
    label,
    value,
}) {
    return (
        <div className="border-b border-zinc-200 p-5 last:border-b-0 sm:nth-[2n]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <div className="text-xs text-zinc-400">
                {label}
            </div>

            <div className="mt-1 text-lg font-bold text-zinc-900">
                {value}
            </div>
        </div>
    );
}

function Info({
    label,
    value,
}) {
    return (
        <div>
            <div className="text-xs text-zinc-400">
                {label}
            </div>

            <div className="mt-1 break-words font-medium capitalize text-zinc-800">
                {value}
            </div>
        </div>
    );
}