import { Link } from "react-router-dom";

function formatPrice(price) {
    if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`;
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function ListingCard({
    listing,
    saved,
    onToggleSave,
}) {
    return (
        <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {listing.website}
                </div>

                <button
                    onClick={() => onToggleSave(listing)}
                    className={`rounded-full px-3 py-1.5 text-lg leading-none ${
                        saved
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                    title={
                        saved
                            ? "Remove from saved"
                            : "Save listing"
                    }
                >
                    {saved ? "♥" : "♡"}
                </button>
            </div>

            <Link
                to={`/listings/${encodeURIComponent(
                    listing.listing_id
                )}`}
                className="block p-5"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-zinc-900">
                            {listing.apartment_name}
                        </h3>

                        <p className="mt-1 text-sm capitalize text-zinc-500">
                            {listing.locality}
                        </p>
                    </div>

                    {listing.is_verified && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            Verified
                        </span>
                    )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-xs text-zinc-400">
                            Price
                        </div>

                        <div className="mt-1 font-semibold text-zinc-900">
                            {formatPrice(listing.price)}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-zinc-400">
                            Area
                        </div>

                        <div className="mt-1 font-semibold text-zinc-900">
                            {Number(
                                listing.carpet_area
                            ).toLocaleString("en-IN")}{" "}
                            sqft
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-zinc-400">
                            Configuration
                        </div>

                        <div className="mt-1 font-medium text-zinc-800">
                            {listing.bedroom} BHK ·{" "}
                            {listing.bathroom} Bath
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-zinc-400">
                            Furnishing
                        </div>

                        <div className="mt-1 font-medium capitalize text-zinc-800">
                            {listing.furnishing}
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}