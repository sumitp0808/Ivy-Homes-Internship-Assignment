import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProject } from "../services/api";

function formatArea(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return `${number.toLocaleString("en-IN")} sq.ft`;
}

/*
 * Project price values in the running API are not
 * consistently in rupees despite the old documentation.
 *
 * Therefore we deliberately label these as API values
 * rather than inventing a currency conversion.
 */
function formatApiPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-IN");
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
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

export default function ProjectDetail() {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const data = await getProject(id);

                if (!cancelled) {
                    setProject(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.message ||
                            "Failed to load project."
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
                    to="/projects"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                >
                    ← Back to projects
                </Link>

                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h1 className="text-lg font-semibold text-red-900">
                        Unable to load project
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className="mx-auto max-w-6xl">
            {/* BACK */}

            <Link
                to="/projects"
                className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
                ← Back to projects
            </Link>

            {/* HEADER */}

            <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Builder Project
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                        {project.apartment_name ||
                            "Project"}
                    </h1>

                    <p className="mt-2 text-sm capitalize text-zinc-500">
                        {project.locality ||
                            "Location unavailable"}
                    </p>
                </div>

                {project.project_status && (
                    <span className="w-fit rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium capitalize text-zinc-700">
                        {project.project_status}
                    </span>
                )}
            </div>

            {/* OVERVIEW */}

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                        label="Project ID"
                        value={
                            project.project_id || id
                        }
                    />

                    <Info
                        label="Developer"
                        value={
                            project.developer_name
                        }
                    />

                    <Info
                        label="Total listings"
                        value={
                            project.total_listings
                        }
                    />

                    <Info
                        label="Total units"
                        value={
                            project.total_units
                        }
                    />
                </div>
            </div>

            {/* PROJECT DETAILS */}

            <section className="mt-6">
                <h2 className="text-xl font-bold text-zinc-900">
                    Project details
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                        label="Developer"
                        value={
                            project.developer_name
                        }
                    />

                    <Info
                        label="Project status"
                        value={
                            project.project_status
                        }
                    />

                    <Info
                        label="Total units"
                        value={
                            project.total_units
                        }
                    />

                    <Info
                        label="Total towers"
                        value={
                            project.total_towers
                        }
                    />

                    <Info
                        label="Total floors"
                        value={
                            project.total_floors
                        }
                    />

                    <Info
                        label="Minimum area"
                        value={formatArea(
                            project.min_area_sqft
                        )}
                    />

                    <Info
                        label="Maximum area"
                        value={formatArea(
                            project.max_area_sqft
                        )}
                    />

                    <Info
                        label="RERA number"
                        value={
                            project.rera_number
                        }
                    />
                </div>
            </section>

            {/* PRICE */}

            <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Pricing
                    </p>

                    <h2 className="text-xl font-bold text-zinc-900">
                        Project price range
                    </h2>

                    <p className="text-xs text-zinc-400">
                        Values shown exactly as returned by
                        the running API.
                    </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Info
                        label="Minimum price (API)"
                        value={
                            formatApiPrice(
                                project.price_min
                            )
                        }
                    />

                    <Info
                        label="Maximum price (API)"
                        value={
                            formatApiPrice(
                                project.price_max
                            )
                        }
                    />
                </div>
            </section>

            {/* TIMELINE */}

            <section className="mt-8">
                <h2 className="text-xl font-bold text-zinc-900">
                    Project timeline
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Info
                        label="Launch date"
                        value={formatDate(
                            project.launch_date
                        )}
                    />

                    <Info
                        label="Possession date"
                        value={formatDate(
                            project.possession_date
                        )}
                    />
                </div>
            </section>

            {/* AMENITIES */}

            {Array.isArray(project.amenities) &&
                project.amenities.length > 0 && (
                    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                        <h2 className="text-xl font-bold text-zinc-900">
                            Amenities
                        </h2>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {project.amenities.map(
                                (amenity, index) => (
                                    <span
                                        key={`${amenity}-${index}`}
                                        className="rounded-full bg-zinc-100 px-3 py-2 text-sm capitalize text-zinc-700"
                                    >
                                        {amenity}
                                    </span>
                                )
                            )}
                        </div>
                    </section>
                )}

            {/* LOCATION */}

            <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-xl font-bold text-zinc-900">
                    Location
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                        label="Locality"
                        value={project.locality}
                    />

                    <Info
                        label="City ID"
                        value={project.city_id}
                    />

                    <Info
                        label="Latitude"
                        value={project.latitude}
                    />

                    <Info
                        label="Longitude"
                        value={project.longitude}
                    />
                </div>
            </section>

            {/* PROJECT URL */}

            {project.project_url && (
                <section className="mt-8">
                    <a
                        href={project.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                    >
                        View project source ↗
                    </a>
                </section>
            )}
        </div>
    );
}