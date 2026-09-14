import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getRental } from "../services/api";

function formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return `₹${number.toLocaleString("en-IN")}`;
}

function formatArea(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return `${number.toLocaleString("en-IN")} sq.ft`;
}

function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-IN");
}

function Info({ label, value }) {
    return (
        <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-zinc-900">
                {value === undefined ||
                value === null ||
                value === ""
                    ? "—"
                    : String(value)}
            </p>
        </div>
    );
}

export default function RentalDetail() {
    const { id } = useParams();

    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const data = await getRental(id);

                if (!cancelled) {
                    setRental(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.message ||
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

    const rentPerSqft = useMemo(() => {
        if (!rental) {
            return null;
        }

        const rent = Number(rental.price);
        const area = Number(rental.carpet_area);

        if (
            !Number.isFinite(rent) ||
            !Number.isFinite(area) ||
            area <= 0
        ) {
            return null;
        }

        return rent / area;
    }, [rental]);

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 h-4 w-28 animate-pulse rounded bg-zinc-200" />

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
                    to="/rentals"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                >
                    ← Back to rentals
                </Link>

                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h1 className="text-lg font-semibold text-red-900">
                        Unable to load rental
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!rental) {
        return null;
    }

    return (
        <div className="mx-auto max-w-6xl">
            {/* BACK */}

            <Link
                to="/rentals"
                className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
                ← Back to rentals
            </Link>

            {/* HEADER */}

            <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Rental Property
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                    {rental.apartment_name ||
                        rental.title ||
                        "Rental property"}
                </h1>

                <p className="mt-2 text-sm capitalize text-zinc-500">
                    {rental.locality ||
                        "Location unavailable"}
                </p>
            </div>

            {/* RENT */}

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">
                            Monthly rent
                        </p>

                        <p className="mt-1 text-3xl font-bold text-zinc-900">
                            {formatPrice(rental.price)}
                        </p>
                    </div>

                    {rentPerSqft !== null && (
                        <div>
                            <p className="text-sm text-zinc-500">
                                Rent per sq.ft.
                            </p>

                            <p className="mt-1 text-xl font-semibold text-zinc-900">
                                ₹
                                {formatNumber(
                                    Math.round(
                                        rentPerSqft
                                    )
                                )}
                                /sq.ft
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
                    <Info
                        label="Bedrooms"
                        value={
                            rental.bedroom
                                ? `${rental.bedroom} BHK`
                                : "—"
                        }
                    />

                    <Info
                        label="Bathrooms"
                        value={
                            rental.bathroom ?? "—"
                        }
                    />

                    <Info
                        label="Property type"
                        value={rental.property_type}
                    />

                    <Info
                        label="Furnishing"
                        value={rental.furnishing}
                    />

                    <Info
                        label="Carpet area"
                        value={formatArea(
                            rental.carpet_area
                        )}
                    />

                    <Info
                        label="Super built-up"
                        value={formatArea(
                            rental.super_builtup_area
                        )}
                    />

                    <Info
                        label="Floor"
                        value={rental.floor}
                    />

                    <Info
                        label="Total floors"
                        value={rental.total_floors}
                    />
                </div>
            </section>

            {/* RENTAL INFORMATION */}

            <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-xl font-bold text-zinc-900">
                    Rental information
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                        label="Monthly rent"
                        value={formatPrice(
                            rental.price
                        )}
                    />

                    <Info
                        label="Security deposit"
                        value={formatPrice(
                            rental.deposit
                        )}
                    />

                    <Info
                        label="Maintenance"
                        value={formatPrice(
                            rental.maintenance
                        )}
                    />

                    <Info
                        label="Listing ID"
                        value={
                            rental.listing_id || id
                        }
                    />

                    <Info
                        label="Posted by"
                        value={rental.posted_by}
                    />

                    <Info
                        label="Posted date"
                        value={
                            rental.posted_at
                                ? new Date(
                                      rental.posted_at
                                  ).toLocaleDateString(
                                      "en-IN"
                                  )
                                : "—"
                        }
                    />

                    <Info
                        label="Facing"
                        value={
                            rental.facing_direction
                        }
                    />

                    <Info
                        label="Website"
                        value={rental.website}
                    />
                </div>
            </section>

            {/* LOCATION */}

            <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-xl font-bold text-zinc-900">
                    Location
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                        label="Locality"
                        value={rental.locality}
                    />

                    <Info
                        label="City ID"
                        value={rental.city_id}
                    />

                    <Info
                        label="Latitude"
                        value={rental.latitude}
                    />

                    <Info
                        label="Longitude"
                        value={rental.longitude}
                    />
                </div>
            </section>

            {/* DESCRIPTION */}

            {rental.description && (
                <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                    <h2 className="text-xl font-bold text-zinc-900">
                        About this rental
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600">
                        {rental.description}
                    </p>
                </section>
            )}
        </div>
    );
}