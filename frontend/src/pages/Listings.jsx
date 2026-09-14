import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ListingCard from "../components/ListingCard";

import { getAllListings } from "../services/listings";

import {
    getSavedListings,
    saveListing,
    removeSavedListing,
} from "../services/saved";

const PAGE_SIZE = 50;

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

export default function Listings({ user }) {
    const [allListings, setAllListings] = useState([]);
    const [savedIds, setSavedIds] = useState(
        new Set()
    );

    const [page, setPage] = useState(1);

    const [locality, setLocality] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [furnishing, setFurnishing] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Load the complete listings collection.
     *
     * The running API caps pages at 50 records and
     * its reported total is not reliable, so
     * getAllListings() handles pagination internally.
     */
    useEffect(() => {
        let cancelled = false;

        async function loadListings() {
            setLoading(true);
            setError("");

            try {
                const listings =
                    await getAllListings();

                if (cancelled) {
                    return;
                }

                setAllListings(
                    Array.isArray(listings)
                        ? listings
                        : []
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.message ||
                            "Failed to load listings."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadListings();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * Load saved listings for the current user.
     */
    useEffect(() => {
        if (!user?.email) {
            setSavedIds(new Set());
            return;
        }

        const savedListings =
            getSavedListings(user.email);

        setSavedIds(
            new Set(
                savedListings.map(
                    (listing) =>
                        listing.listing_id
                )
            )
        );
    }, [user?.email]);

    /*
     * Build locality options from the actual
     * retrieved dataset.
     */
    const localities = useMemo(() => {
        return [
            ...new Set(
                allListings
                    .map(
                        (listing) =>
                            listing.locality
                    )
                    .filter(Boolean)
            ),
        ].sort((a, b) =>
            String(a).localeCompare(
                String(b)
            )
        );
    }, [allListings]);

    /*
     * Apply all filters locally.
     *
     * This intentionally does not depend on server-side
     * filtering because the assignment requires the
     * filters to actually work even when the server
     * ignores documented parameters.
     */
    const filteredListings = useMemo(() => {
        return allListings.filter(
            (listing) => {
                const listingLocality =
                    String(
                        listing.locality || ""
                    ).toLowerCase();

                const selectedLocality =
                    String(
                        locality || ""
                    ).toLowerCase();

                const listingBedrooms =
                    Number(
                        listing.bedroom
                    );

                const listingPrice =
                    Number(
                        listing.price
                    );

                const listingFurnishing =
                    String(
                        listing.furnishing ||
                            ""
                    ).toLowerCase();

                const selectedFurnishing =
                    String(
                        furnishing || ""
                    ).toLowerCase();

                const matchesLocality =
                    !selectedLocality ||
                    listingLocality ===
                        selectedLocality;

                const matchesBedrooms =
                    !bedrooms ||
                    listingBedrooms ===
                        Number(
                            bedrooms
                        );

                const matchesMinPrice =
                    !minPrice ||
                    (
                        Number.isFinite(
                            listingPrice
                        ) &&
                        listingPrice >=
                            Number(
                                minPrice
                            )
                    );

                const matchesMaxPrice =
                    !maxPrice ||
                    (
                        Number.isFinite(
                            listingPrice
                        ) &&
                        listingPrice <=
                            Number(
                                maxPrice
                            )
                    );

                const matchesFurnishing =
                    !selectedFurnishing ||
                    listingFurnishing ===
                        selectedFurnishing;

                return (
                    matchesLocality &&
                    matchesBedrooms &&
                    matchesMinPrice &&
                    matchesMaxPrice &&
                    matchesFurnishing
                );
            }
        );
    }, [
        allListings,
        locality,
        bedrooms,
        minPrice,
        maxPrice,
        furnishing,
    ]);

    /*
     * Whenever filters change, return to page 1.
     */
    useEffect(() => {
        setPage(1);
    }, [
        locality,
        bedrooms,
        minPrice,
        maxPrice,
        furnishing,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredListings.length /
                PAGE_SIZE
        )
    );

    const safePage = Math.min(
        page,
        totalPages
    );

    const visibleListings =
        filteredListings.slice(
            (safePage - 1) *
                PAGE_SIZE,
            safePage * PAGE_SIZE
        );

    function resetFilters() {
        setLocality("");
        setBedrooms("");
        setMinPrice("");
        setMaxPrice("");
        setFurnishing("");
        setPage(1);
    }

    function toggleSave(listing) {
        if (!user?.email) {
            return;
        }

        const id =
            listing.listing_id;

        if (savedIds.has(id)) {
            removeSavedListing(
                user.email,
                id
            );

            setSavedIds((current) => {
                const next =
                    new Set(current);

                next.delete(id);

                return next;
            });
        } else {
            saveListing(
                user.email,
                listing
            );

            setSavedIds((current) => {
                const next =
                    new Set(current);

                next.add(id);

                return next;
            });
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />

                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-200" />
                </div>

                <div className="mb-6 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 md:grid-cols-5">
                    {Array.from({
                        length: 5,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-10 animate-pulse rounded-lg bg-zinc-100"
                        />
                    ))}
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({
                        length: 6,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-64 animate-pulse rounded-2xl bg-zinc-100"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl">
            {/* HEADER */}

            <div className="mb-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Marketplace
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                            Listings
                        </h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            Browse properties available
                            in your city.
                        </p>
                    </div>

                    <div className="text-sm text-zinc-500">
                        {filteredListings.length.toLocaleString(
                            "en-IN"
                        )}{" "}
                        results
                    </div>
                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="font-medium text-red-900">
                        Failed to load listings
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                        {error}
                    </p>
                </div>
            )}

            {/* FILTERS */}

            <section className="mb-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-semibold text-zinc-900">
                            Filters
                        </h2>

                        <p className="mt-1 text-xs text-zinc-500">
                            Filters are applied locally to
                            the retrieved dataset.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                    >
                        Reset
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {/* LOCALITY */}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Locality
                        </label>

                        <select
                            value={locality}
                            onChange={(event) =>
                                setLocality(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                        >
                            <option value="">
                                All localities
                            </option>

                            {localities.map(
                                (item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* BEDROOMS */}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Bedrooms
                        </label>

                        <select
                            value={bedrooms}
                            onChange={(event) =>
                                setBedrooms(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                        >
                            <option value="">
                                All BHK
                            </option>

                            {[1, 2, 3, 4, 5].map(
                                (value) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {value} BHK
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* MIN PRICE */}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Min price
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={minPrice}
                            onChange={(event) =>
                                setMinPrice(
                                    event.target.value
                                )
                            }
                            placeholder="₹ minimum"
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                        />
                    </div>

                    {/* MAX PRICE */}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Max price
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={maxPrice}
                            onChange={(event) =>
                                setMaxPrice(
                                    event.target.value
                                )
                            }
                            placeholder="₹ maximum"
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                        />
                    </div>

                    {/* FURNISHING */}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Furnishing
                        </label>

                        <select
                            value={furnishing}
                            onChange={(event) =>
                                setFurnishing(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                        >
                            <option value="">
                                All furnishing
                            </option>

                            <option value="unfurnished">
                                Unfurnished
                            </option>

                            <option value="semi-furnished">
                                Semi-furnished
                            </option>

                            <option value="fully-furnished">
                                Fully-furnished
                            </option>
                        </select>
                    </div>
                </div>
            </section>

            {/* EMPTY STATE */}

            {visibleListings.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        No listings found
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                        Try changing or resetting your
                        filters.
                    </p>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <>
                    {/* LISTINGS GRID */}

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visibleListings.map((listing) => (
                            <div
                                key={listing.listing_id}
                                className="relative"
                            >
                                <ListingCard
                                    listing={listing}
                                    saved={savedIds.has(
                                        listing.listing_id
                                    )}
                                    onToggleSave={() =>
                                        toggleSave(listing)
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION */}

                    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row">
                        <p className="text-sm text-zinc-500">
                            Showing{" "}
                            <span className="font-medium text-zinc-800">
                                {((safePage - 1) * PAGE_SIZE + 1).toLocaleString("en-IN")}
                            </span>
                            {" – "}
                            <span className="font-medium text-zinc-800">
                                {Math.min(
                                    safePage * PAGE_SIZE,
                                    filteredListings.length
                                ).toLocaleString("en-IN")}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-zinc-800">
                                {filteredListings.length.toLocaleString("en-IN")}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(1, current - 1)
                                    )
                                }
                                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50"
                            >
                                Previous
                            </button>

                            <span className="px-2 text-sm text-zinc-500">
                                Page{" "}
                                <span className="font-semibold text-zinc-900">
                                    {safePage}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-zinc-900">
                                    {totalPages}
                                </span>
                            </span>

                            <button
                                type="button"
                                disabled={safePage >= totalPages}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(totalPages, current + 1)
                                    )
                                }
                                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}