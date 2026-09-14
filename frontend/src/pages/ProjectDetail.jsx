import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getProject } from "../services/api";

function formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return `₹${number.toLocaleString(
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

export default function ProjectDetail() {
    const { id } = useParams();

    const [project, setProject] =
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
                    await getProject(id);

                if (!cancelled) {
                    setProject(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message ||
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
            <div className="rounded-xl border border-zinc-200 bg-white p-8">
                Loading project...
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Link
                    to="/projects"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                    ← Back to projects
                </Link>

                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-8">
                Project not found.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            <Link
                to="/projects"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
                ← Back to projects
            </Link>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 p-6 lg:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Project
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 lg:text-3xl">
                        {project.name ||
                            project.project_name ||
                            id}
                    </h1>

                    <p className="mt-2 capitalize text-zinc-500">
                        {project.locality ||
                            project.location ||
                            "—"}
                    </p>
                </div>

                <div className="grid border-b border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                        label="Project ID"
                        value={
                            project.project_id ||
                            id
                        }
                    />

                    <Metric
                        label="Listings"
                        value={
                            project.total_listings ??
                            "—"
                        }
                    />

                    <Metric
                        label="Minimum price"
                        value={
                            project.price_min !==
                            undefined
                                ? formatPrice(
                                      project.price_min
                                  )
                                : "—"
                        }
                    />

                    <Metric
                        label="Maximum price"
                        value={
                            project.price_max !==
                            undefined
                                ? formatPrice(
                                      project.price_max
                                  )
                                : "—"
                        }
                    />
                </div>

                <div className="grid gap-10 p-6 md:grid-cols-2 lg:p-8">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Project information
                        </h2>

                        <div className="mt-5 grid grid-cols-2 gap-6">
                            <Info
                                label="Project ID"
                                value={
                                    project.project_id ||
                                    id
                                }
                            />

                            <Info
                                label="Name"
                                value={
                                    project.name ||
                                    project.project_name
                                }
                            />

                            <Info
                                label="Locality"
                                value={
                                    project.locality
                                }
                            />

                            <Info
                                label="City"
                                value={
                                    project.city
                                }
                            />

                            <Info
                                label="Developer"
                                value={
                                    project.developer
                                }
                            />

                            <Info
                                label="Total listings"
                                value={
                                    project.total_listings
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Pricing
                        </h2>

                        <div className="mt-5 space-y-6">
                            <Info
                                label="Minimum price"
                                value={
                                    project.price_min !==
                                    undefined
                                        ? formatPrice(
                                              project.price_min
                                          )
                                        : null
                                }
                            />

                            <Info
                                label="Maximum price"
                                value={
                                    project.price_max !==
                                    undefined
                                        ? formatPrice(
                                              project.price_max
                                          )
                                        : null
                                }
                            />

                            <Info
                                label="Status"
                                value={
                                    project.status
                                }
                            />

                            <Info
                                label="Property type"
                                value={
                                    project.property_type
                                }
                            />
                        </div>
                    </div>
                </div>

                {project.description && (
                    <div className="border-t border-zinc-200 p-6 lg:p-8">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Description
                        </h2>

                        <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-700">
                            {
                                project.description
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