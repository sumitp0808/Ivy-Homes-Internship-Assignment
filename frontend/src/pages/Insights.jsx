import { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";

const findings = [
    {
        title: "Retrievable listing records",
        value: "3,500",
        description:
            "The running listings endpoint returned 3,500 records when paged to an empty response.",
    },
    {
        title: "Active listing records",
        value: "2,792",
        description:
            "2,792 retrieved records have is_live=true.",
    },
    {
        title: "Corrupt listings",
        value: "121",
        description:
            "Records violating basic physical/data constraints such as non-positive price or area, carpet area exceeding SBU, or floor exceeding total floors.",
    },
    {
        title: "Fake listings",
        value: "6",
        description:
            "Six extreme low price-per-carpet-area outliers form a clear discontinuity from the rest of the valid dataset.",
    },
    {
        title: "Duplicate physical property",
        value: "1",
        description:
            "One pair appears to describe the same physical property despite separate listing records.",
    },
    {
        title: "7-day listing window",
        value: "See analysis",
        description:
            "Listings are anchored to [2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30).",
    },
];

export default function Insights() {
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await getAnalytics();
                setAnalytics(data);
            } catch (err) {
                setError(err.message);
            }
        }

        load();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    Insights
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                    API analytics combined with the data-quality
                    investigation performed for this assignment.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                    Analytics endpoint unavailable:
                    <div className="mt-1 font-medium">
                        {error}
                    </div>
                </div>
            )}

            {analytics && (
                <section>
                    <h2 className="mb-4 text-lg font-semibold">
                        API analytics
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Metric
                            label="City"
                            value={analytics.city}
                        />

                        <Metric
                            label="Total listings"
                            value={Number(
                                analytics.total_listings
                            ).toLocaleString("en-IN")}
                        />

                        <Metric
                            label="Median price"
                            value={`₹${Number(
                                analytics.median_price
                            ).toLocaleString("en-IN")}`}
                        />

                        <Metric
                            label="Median ₹/sqft"
                            value={`₹${Number(
                                analytics.median_price_per_sqft
                            ).toLocaleString("en-IN")}`}
                        />
                    </div>

                    {analytics.by_locality?.length > 0 && (
                        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                            <h3 className="font-semibold">
                                By locality
                            </h3>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs uppercase text-zinc-400">
                                        <tr>
                                            <th className="pb-3">
                                                Locality
                                            </th>
                                            <th className="pb-3">
                                                Listings
                                            </th>
                                            <th className="pb-3">
                                                Median price
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {analytics.by_locality.map(
                                            (item) => (
                                                <tr
                                                    key={
                                                        item.locality
                                                    }
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="py-3 capitalize">
                                                        {
                                                            item.locality
                                                        }
                                                    </td>

                                                    <td className="py-3">
                                                        {Number(
                                                            item.count
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="py-3">
                                                        ₹
                                                        {Number(
                                                            item.median_price
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {analytics.by_bhk?.length > 0 && (
                        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                            <h3 className="font-semibold">
                                By BHK
                            </h3>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {analytics.by_bhk.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.bedroom
                                            }
                                            className="rounded-lg bg-zinc-50 p-4"
                                        >
                                            <div className="text-2xl font-bold">
                                                {
                                                    item.bedroom
                                                }{" "}
                                                BHK
                                            </div>

                                            <div className="mt-1 text-sm text-zinc-500">
                                                {Number(
                                                    item.count
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}{" "}
                                                listings
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </section>
            )}

            <section className="mt-10">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Investigation findings
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Results discovered by testing the running
                        API rather than trusting the reference
                        documentation.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {findings.map((finding) => (
                        <article
                            key={finding.title}
                            className="rounded-xl border border-zinc-200 bg-white p-5"
                        >
                            <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                Finding
                            </div>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <h3 className="font-semibold">
                                    {finding.title}
                                </h3>

                                <span className="text-xl font-bold">
                                    {finding.value}
                                </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-zinc-500">
                                {finding.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
                <h2 className="font-semibold">
                    Data quality warning
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                    API-returned seller content is displayed as data,
                    not as application instructions. Descriptions and
                    other free-text fields were treated as untrusted
                    seller data during the investigation.
                </p>
            </section>
        </div>
    );
}

function Metric({ label, value }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-sm text-zinc-500">
                {label}
            </div>

            <div className="mt-2 text-2xl font-bold capitalize">
                {value}
            </div>
        </div>
    );
}