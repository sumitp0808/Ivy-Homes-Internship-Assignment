import { useEffect, useMemo, useState } from "react";
import { getRentals } from "../services/api";

function formatRent(value) {
    return `₹${Number(value).toLocaleString("en-IN")}/month`;
}

export default function Rentals() {
    const [rentals, setRentals] = useState([]);
    const [locality, setLocality] = useState("");
    const [bedroom, setBedroom] = useState("");
    const [furnishing, setFurnishing] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const response = await getRentals({
                    limit: 200,
                    offset: 0,
                });

                setRentals(response.results || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const localities = useMemo(
        () =>
            [
                ...new Set(
                    rentals
                        .map((rental) => rental.locality)
                        .filter(Boolean)
                ),
            ].sort(),
        [rentals]
    );

    const filtered = rentals.filter((rental) => {
        return (
            (!locality ||
                rental.locality?.toLowerCase() ===
                    locality.toLowerCase()) &&
            (!bedroom ||
                Number(rental.bedroom) === Number(bedroom)) &&
            (!furnishing ||
                rental.furnishing?.toLowerCase() ===
                    furnishing.toLowerCase())
        );
    });

    const pageSize = 30;
    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize)
    );

    const visible = filtered.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    if (loading) {
        return <div>Loading rentals...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Rentals
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                    Monthly rental listings.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 md:grid-cols-3">
                <select
                    value={locality}
                    onChange={(e) => {
                        setLocality(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                >
                    <option value="">All localities</option>

                    {localities.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <select
                    value={bedroom}
                    onChange={(e) => {
                        setBedroom(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                >
                    <option value="">All BHK</option>
                    {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                            {value} BHK
                        </option>
                    ))}
                </select>

                <select
                    value={furnishing}
                    onChange={(e) => {
                        setFurnishing(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                >
                    <option value="">All furnishing</option>
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((rental) => (
                    <article
                        key={rental.listing_id}
                        className="rounded-xl border border-zinc-200 bg-white p-5"
                    >
                        <div className="text-xs uppercase tracking-wide text-zinc-400">
                            {rental.website}
                        </div>

                        <h2 className="mt-2 font-semibold">
                            {rental.apartment_name}
                        </h2>

                        <p className="mt-1 text-sm capitalize text-zinc-500">
                            {rental.locality}
                        </p>

                        <div className="mt-5 text-xl font-bold">
                            {formatRent(rental.price)}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <Info
                                label="Area"
                                value={`${Number(
                                    rental.carpet_area
                                ).toLocaleString(
                                    "en-IN"
                                )} sqft`}
                            />

                            <Info
                                label="Configuration"
                                value={`${rental.bedroom} BHK`}
                            />

                            <Info
                                label="Furnishing"
                                value={rental.furnishing}
                            />

                            <Info
                                label="Deposit"
                                value={`₹${Number(
                                    rental.deposit
                                ).toLocaleString(
                                    "en-IN"
                                )}`}
                            />
                        </div>
                    </article>
                ))}
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
            />
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <div className="text-xs text-zinc-400">
                {label}
            </div>

            <div className="mt-1 capitalize font-medium text-zinc-800">
                {value}
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, onChange }) {
    return (
        <div className="mt-8 flex justify-center gap-4">
            <button
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
                className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
                Previous
            </button>

            <span className="px-3 py-2 text-sm text-zinc-500">
                {page} / {totalPages}
            </span>

            <button
                disabled={page === totalPages}
                onClick={() => onChange(page + 1)}
                className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
                Next
            </button>
        </div>
    );
}