import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    addFavourite,
    getListing,
    getSimilarListings,
    getFavourites,
    removeFavourite,
} from "../services/api";

function formatPrice(price) {
    if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`;
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function ListingDetail() {
    const { id } = useParams();

    const [listing, setListing] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [listingData, similarData, favourites] =
                    await Promise.all([
                        getListing(id),
                        getSimilarListings(id),
                        getFavourites(),
                    ]);

                setListing(listingData);
                setSimilar(similarData?.results || []);

                setSaved(
                    (favourites?.results || []).some(
                        (item) => item.listing_id === id
                    )
                );
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    async function toggleSave() {
        if (saved) {
            await removeFavourite(id);
            setSaved(false);
        } else {
            await addFavourite(id);
            setSaved(true);
        }
    }

    if (loading) {
        return <div className="p-10">Loading listing...</div>;
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                {error}
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
                                    : "border border-zinc-300 bg-white text-zinc-800"
                            }`}
                        >
                            {saved
                                ? "♥ Saved"
                                : "♡ Save listing"}
                        </button>
                    </div>
                </div>

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

                <div className="border-t border-zinc-200 p-6 lg:p-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                        Description
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-700">
                        {listing.description}
                    </p>
                </div>
            </div>

            {similar.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-bold">
                        Similar listings
                    </h2>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {similar.slice(0, 4).map((item) => (
                            <Link
                                key={item.listing_id}
                                to={`/listings/${item.listing_id}`}
                                className="rounded-xl border border-zinc-200 bg-white p-5 hover:shadow-sm"
                            >
                                <div className="font-semibold">
                                    {item.apartment_name}
                                </div>

                                <div className="mt-1 text-sm text-zinc-500">
                                    {item.bedroom} BHK ·{" "}
                                    {formatPrice(item.price)}
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