import { useEffect, useMemo, useState } from "react";
import ListingCard from "../components/ListingCard";
import { getListings } from "../services/api";
import {
    getSavedListings,
    saveListing,
    removeSavedListing,
} from "../services/saved";

const PAGE_SIZE = 50;

export default function Listings({ user }) {
    const [allListings, setAllListings] = useState([]);
    const [savedIds, setSavedIds] = useState(new Set());

    const [page, setPage] = useState(1);

    const [locality, setLocality] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [furnishing, setFurnishing] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Load the complete listing dataset once.
     *
     * The running API uses offset pagination and caps responses
     * at 50 records, so we advance by the number actually received.
     */
    useEffect(() => {
        let cancelled = false;

        async function loadListings() {
            setLoading(true);
            setError("");

            try {
                const collected = [];
                let offset = 0;

                while (true) {
                    const response = await getListings({
                        limit: 50,
                        offset,
                    });

                    const results = response?.results || [];

                    collected.push(...results);

                    if (
                        results.length === 0 ||
                        results.length < 50 ||
                        response?.has_more === false
                    ) {
                        break;
                    }

                    offset += results.length;
                }

                if (!cancelled) {
                    setAllListings(collected);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load listings.");
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
     * Load locally saved listings for this authenticated user.
     */
    useEffect(() => {
        if (!user?.email) {
            setSavedIds(new Set());
            return;
        }

        const saved = getSavedListings(user.email);

        setSavedIds(
            new Set(
                saved.map((listing) => listing.listing_id)
            )
        );
    }, [user?.email]);

    const localities = useMemo(() => {
        return [
            ...new Set(
                allListings
                    .map((listing) => listing.locality)
                    .filter(Boolean)
            ),
        ].sort();
    }, [allListings]);

    const filteredListings = useMemo(() => {
        return allListings.filter((listing) => {
            const matchesLocality =
                !locality ||
                listing.locality?.toLowerCase() ===
                    locality.toLowerCase();

            const matchesBedrooms =
                !bedrooms ||
                Number(listing.bedroom) === Number(bedrooms);

            const matchesMinPrice =
                !minPrice ||
                Number(listing.price) >= Number(minPrice);

            const matchesMaxPrice =
                !maxPrice ||
                Number(listing.price) <= Number(maxPrice);

            const matchesFurnishing =
                !furnishing ||
                listing.furnishing?.toLowerCase() ===
                    furnishing.toLowerCase();

            return (
                matchesLocality &&
                matchesBedrooms &&
                matchesMinPrice &&
                matchesMaxPrice &&
                matchesFurnishing
            );
        });
    }, [
        allListings,
        locality,
        bedrooms,
        minPrice,
        maxPrice,
        furnishing,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredListings.length / PAGE_SIZE)
    );

    const visibleListings = filteredListings.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    function resetFilters() {
        setLocality("");
        setBedrooms("");
        setMinPrice("");
        setMaxPrice("");
        setFurnishing("");
        setPage(1);
    }

    function handleFilterChange(setter) {
        return (event) => {
            setter(event.target.value);
            setPage(1);
        };
    }

    function toggleSave(listing) {
        if (!user?.email) {
            return;
        }

        const isSaved = savedIds.has(listing.listing_id);

        if (isSaved) {
            removeSavedListing(
                user.email,
                listing.listing_id
            );

            setSavedIds((previous) => {
                const next = new Set(previous);
                next.delete(listing.listing_id);
                return next;
            });
        } else {
            saveListing(user.email, listing);

            setSavedIds((previous) => {
                const next = new Set(previous);
                next.add(listing.listing_id);
                return next;
            });
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Listings
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Loading available properties...
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-72 animate-pulse rounded-xl border border-zinc-200 bg-white"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h1 className="font-semibold text-red-900">
                    Could not load listings
                </h1>

                <p className="mt-2 text-sm text-red-700">
                    {error}
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Property marketplace
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
                        Listings
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        {filteredListings.length.toLocaleString("en-IN")} properties
                        matching your filters
                    </p>
                </div>

                <div className="text-xs text-zinc-400">
                    {allListings.length.toLocaleString("en-IN")} records loaded
                </div>
            </div>

            {/* Filters */}
            <section className="rounded-xl border border-zinc-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900">
                        Filters
                    </h2>

                    <button
                        onClick={resetFilters}
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                    >
                        Clear all
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Locality
                        </span>

                        <select
                            value={locality}
                            onChange={handleFilterChange(setLocality)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
                        >
                            <option value="">All localities</option>

                            {localities.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Bedrooms
                        </span>

                        <select
                            value={bedrooms}
                            onChange={handleFilterChange(setBedrooms)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
                        >
                            <option value="">Any BHK</option>
                            <option value="1">1 BHK</option>
                            <option value="2">2 BHK</option>
                            <option value="3">3 BHK</option>
                            <option value="4">4 BHK</option>
                            <option value="5">5 BHK</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Min price
                        </span>

                        <input
                            type="number"
                            min="0"
                            value={minPrice}
                            onChange={handleFilterChange(setMinPrice)}
                            placeholder="₹ minimum"
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Max price
                        </span>

                        <input
                            type="number"
                            min="0"
                            value={maxPrice}
                            onChange={handleFilterChange(setMaxPrice)}
                            placeholder="₹ maximum"
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                            Furnishing
                        </span>

                        <select
                            value={furnishing}
                            onChange={handleFilterChange(setFurnishing)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
                        >
                            <option value="">Any furnishing</option>
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
                    </label>
                </div>
            </section>

            {/* Results */}
            {visibleListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
                    <div className="text-3xl">⌕</div>

                    <h2 className="mt-3 font-semibold text-zinc-900">
                        No listings found
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Try relaxing one or more filters.
                    </p>

                    <button
                        onClick={resetFilters}
                        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleListings.map((listing) => (
                        <ListingCard
                            key={listing.listing_id}
                            listing={listing}
                            saved={savedIds.has(listing.listing_id)}
                            onToggleSave={toggleSave}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-200 pt-5">
                    <p className="text-xs text-zinc-500">
                        Page {page} of {totalPages}
                    </p>

                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() =>
                                setPage((current) =>
                                    Math.max(1, current - 1)
                                )
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <button
                            disabled={page === totalPages}
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(totalPages, current + 1)
                                )
                            }
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}