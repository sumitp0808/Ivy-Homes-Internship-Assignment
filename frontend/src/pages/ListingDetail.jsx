import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getAllListings,
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
        return `₹${(value / 10000000).toFixed(2)} Cr`;
    }

    if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`;
    }

    return `₹${value.toLocaleString("en-IN")}`;
}

function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-IN");
}

export default function ListingDetail({ user }) {
    const { id } = useParams();

    const [listing, setListing] =
        useState(null);

    const [similarListings, setSimilarListings] =
        useState([]);

    const [saved, setSaved] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
    setLoading(true);
    setError("");

    try {
        const listings = await getAllListings();

        if (cancelled) {
            return;
        }

        const currentListing =
            listings.find(
                (listing) =>
                    String(listing.listing_id) ===
                    String(id)
            );

        if (!currentListing) {
            throw new Error("Listing not found.");
        }

        setListing(currentListing);

        const similar =
            getSimilarListingsFromCollection(
                currentListing,
                listings,
                4
            );

        setSimilarListings(similar);
    } catch (err) {
        if (!cancelled) {
            setError(
                err?.message ||
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
    }, [id]);

    /*
     * Load saved state for current user.
     */
    useEffect(() => {
        if (!user?.email || !id) {
            setSaved(false);
            return;
        }

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
    }, [user?.email, id]);

    const pricePerSqft = useMemo(() => {
        if (!listing) {
            return null;
        }

        const price =
            Number(listing.price);

        const carpet =
            Number(
                listing.carpet_area
            );

        if (
            !Number.isFinite(price) ||
            !Number.isFinite(carpet) ||
            carpet <= 0
        ) {
            return null;
        }

        return price / carpet;
    }, [listing]);

    function toggleSave() {
        if (!user?.email || !listing) {
            return;
        }

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
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 h-4 w-24 animate-pulse rounded bg-zinc-200" />

                <div className="h-10 w-2/3 animate-pulse rounded bg-zinc-200" />

                <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-zinc-200" />

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
                    <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
                    <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/listings"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                >
                    ← Back to listings
                </Link>

                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h1 className="text-lg font-semibold text-red-900">
                        Unable to load listing
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!listing) {
        return null;
    }

    return (
        <div className="mx-auto max-w-6xl">
            {/* BACK */}

            <Link
                to="/listings"
                className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
                ← Back to listings
            </Link>

            {/* HEADER */}

            <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Property Listing
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                        {listing.apartment_name || "Property"}
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        {listing.locality ||
                            listing.location ||
                            "Location unavailable"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={toggleSave}
                    disabled={!user}
                    className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                        saved
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {saved
                        ? "Saved"
                        : "Save listing"}
                </button>
            </div>

            {/* PRICE */}

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">
                            Asking price
                        </p>

                        <p className="mt-1 text-3xl font-bold text-zinc-900">
                            {formatPrice(
                                listing.price
                            )}
                        </p>
                    </div>

                    {pricePerSqft !== null && (
                        <div>
                            <p className="text-sm text-zinc-500">
                                Price per sq.ft.
                            </p>

                            <p className="mt-1 text-xl font-semibold text-zinc-900">
                                ₹
                                {formatNumber(
                                    Math.round(
                                        pricePerSqft
                                    )
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* PROPERTY DETAILS */}

            <section className="mt-6">
                <h2 className="text-xl font-bold text-zinc-900">
                    Property details
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                        label="Bedrooms"
                        value={
                            listing.bedroom
                                ? `${listing.bedroom} BHK`
                                : "—"
                        }
                    />

                    <DetailItem
                        label="Bathrooms"
                        value={
                            listing.bathroom ??
                            "—"
                        }
                    />

                    <DetailItem
                        label="Carpet area"
                        value={
                            listing.carpet_area
                                ? `${formatNumber(
                                      listing.carpet_area
                                  )} sq.ft`
                                : "—"
                        }
                    />

                    <DetailItem
                        label="Super built-up"
                        value={
                            listing.super_built_up_area
                                ? `${formatNumber(
                                      listing.super_built_up_area
                                  )} sq.ft`
                                : "—"
                        }
                    />

                    <DetailItem
                        label="Floor"
                        value={
                            listing.floor ??
                            "—"
                        }
                    />

                    <DetailItem
                        label="Total floors"
                        value={
                            listing.total_floors ??
                            "—"
                        }
                    />

                    <DetailItem
                        label="Furnishing"
                        value={
                            listing.furnishing ||
                            "—"
                        }
                    />

                    <DetailItem
                        label="Listing ID"
                        value={
                            listing.listing_id
                        }
                    />
                </div>
            </section>

            {/* LOCATION */}

            <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-xl font-bold text-zinc-900">
                    Location
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <DetailItem
                        label="Locality"
                        value={
                            listing.locality ||
                            "—"
                        }
                    />

                    <DetailItem
                        label="Project ID"
                        value={
                            listing.project_name ||
                            listing.project_id ||
                            "—"
                        }
                    />

                    <DetailItem
                        label="City ID"
                        value={
                            listing.city_id ||
                            "—"
                        }
                    />

                    <DetailItem
                        label="Verified"
                        value={
                            listing.is_verified
                                ? "Yes"
                                : "No"
                        }
                    />
                </div>
            </section>

            {/* DESCRIPTION */}

            {(listing.description ||
                listing.title) && (
                <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                    <h2 className="text-xl font-bold text-zinc-900">
                        About this listing
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600">
                        {listing.description ||
                            listing.title}
                    </p>
                </section>
            )}

            {/* SIMILAR */}

            {similarListings.length >
                0 && (
                <section className="mt-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Recommendations
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-zinc-900">
                                Similar listings
                            </h2>
                        </div>

                        <Link
                            to="/listings"
                            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                        >
                            View all
                        </Link>
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {similarListings.map(
                            (item) => (
                                <Link
                                    key={
                                        item.listing_id
                                    }
                                    to={`/listings/${encodeURIComponent(
                                        item.listing_id
                                    )}`}
                                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <p className="text-lg font-bold text-zinc-900">
                                        {formatPrice(
                                            item.price
                                        )}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-zinc-800">
                                        {item.bedroom
                                            ? `${item.bedroom} BHK`
                                            : "Property"}
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        {item.locality ||
                                            item.project_name ||
                                            "Location unavailable"}
                                    </p>

                                    <div className="mt-4 flex gap-3 text-xs text-zinc-500">
                                        <span>
                                            {item.carpet_area
                                                ? `${formatNumber(
                                                      item.carpet_area
                                                  )} sq.ft`
                                                : "Area —"}
                                        </span>

                                        <span>
                                            {item.furnishing ||
                                                "Furnishing —"}
                                        </span>
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

function DetailItem({
    label,
    value,
}) {
    return (
        <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-zinc-900">
                {value}
            </p>
        </div>
    );
}