import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getRental } from "../services/api";

function formatPrice(price) {
    const value = Number(price);

    if (!Number.isFinite(value)) {
        return "—";
    }

    return `₹${value.toLocaleString(
        "en-IN"
    )}`;
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

            <div className="mt-1 font-medium capitalize text-zinc-800">
                {value === undefined ||
                value === null ||
                value === ""
                    ? "—"
                    : String(value)}
            </div>
        </div>
    );
}

export default function RentalDetail() {
    const { id } = useParams();

    const [rental, setRental] =
        useState(null);

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
                const data =
                    await getRental(id);

                if (!cancelled) {
                    setRental(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message ||
                            "Failed to load rental."
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

    if (loading) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-8">
                Loading rental...
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Link
                    to="/rentals"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                    ← Back to rentals
                </Link>

                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!rental) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-8">
                Rental not found.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            <Link
                to="/rentals"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
                ← Back to rentals
            </Link>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 p-6 lg:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Rental
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                        {rental.apartment_name ||
                            rental.property_name ||
                            rental.listing_id ||
                            "Rental property"}
                    </h1>

                    <p className="mt-2 capitalize text-zinc-500">
                        {rental.locality || "—"}
                    </p>
                </div>

                <div className="grid border-b border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                        label="Monthly rent"
                        value={formatPrice(
                            rental.rent ??
                                rental.monthly_rent ??
                                rental.price
                        )}
                    />

                    <Metric
                        label="Bedrooms"
                        value={`${rental.bedroom ?? "—"} BHK`}
                    />

                    <Metric
                        label="Area"
                        value={
                            rental.carpet_area
                                ? `${Number(
                                      rental.carpet_area
                                  ).toLocaleString(
                                      "en-IN"
                                  )} sqft`
                                : "—"
                        }
                    />

                    <Metric
                        label="Listing ID"
                        value={
                            rental.listing_id ||
                            id
                        }
                    />
                </div>

                <div className="grid gap-10 p-6 md:grid-cols-2 lg:p-8">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Property
                        </h2>

                        <div className="mt-5 grid grid-cols-2 gap-6">
                            <Info
                                label="Bedrooms"
                                value={
                                    rental.bedroom
                                }
                            />

                            <Info
                                label="Bathrooms"
                                value={
                                    rental.bathroom
                                }
                            />

                            <Info
                                label="Carpet area"
                                value={
                                    rental.carpet_area
                                        ? `${Number(
                                              rental.carpet_area
                                          ).toLocaleString(
                                              "en-IN"
                                          )} sqft`
                                        : null
                                }
                            />

                            <Info
                                label="Floor"
                                value={
                                    rental.floor
                                }
                            />

                            <Info
                                label="Furnishing"
                                value={
                                    rental.furnishing
                                }
                            />

                            <Info
                                label="Locality"
                                value={
                                    rental.locality
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Rental information
                        </h2>

                        <div className="mt-5 space-y-6">
                            <Info
                                label="Listing ID"
                                value={
                                    rental.listing_id ||
                                    id
                                }
                            />

                            <Info
                                label="Monthly rent"
                                value={formatPrice(
                                    rental.rent ??
                                        rental.monthly_rent ??
                                        rental.price
                                )}
                            />

                            <Info
                                label="Deposit"
                                value={
                                    rental.deposit
                                        ? formatPrice(
                                              rental.deposit
                                          )
                                        : null
                                }
                            />

                            <Info
                                label="Posted by"
                                value={
                                    rental.posted_by
                                }
                            />
                        </div>
                    </div>
                </div>

                {rental.description && (
                    <div className="border-t border-zinc-200 p-6 lg:p-8">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Description
                        </h2>

                        <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-700">
                            {
                                rental.description
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
}) {
    return (
        <div className="border-b border-zinc-200 p-5 lg:border-b-0 lg:border-r last:border-r-0">
            <div className="text-xs text-zinc-400">
                {label}
            </div>

            <div className="mt-1 font-bold text-zinc-900">
                {value}
            </div>
        </div>
    );
}