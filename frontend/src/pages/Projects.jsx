import { useEffect, useMemo, useState } from "react";
import { getProjects } from "../services/api";
import { Link } from "react-router-dom";

function formatArea(value) {
    return `${Number(value).toLocaleString("en-IN")} sqft`;
}

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [locality, setLocality] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const response = await getProjects({
                    limit: 200,
                    offset: 0,
                });

                setProjects(response.results || []);
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
                    projects
                        .map((project) => project.locality)
                        .filter(Boolean)
                ),
            ].sort(),
        [projects]
    );

    const statuses = useMemo(
        () =>
            [
                ...new Set(
                    projects
                        .map(
                            (project) =>
                                project.project_status
                        )
                        .filter(Boolean)
                ),
            ].sort(),
        [projects]
    );

    const filtered = projects.filter((project) => {
        return (
            (!locality ||
                project.locality?.toLowerCase() ===
                    locality.toLowerCase()) &&
            (!status ||
                project.project_status?.toLowerCase() ===
                    status.toLowerCase())
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
        return <div>Loading projects...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Projects
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                    Builder projects in your city.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 md:grid-cols-2">
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
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                >
                    <option value="">All statuses</option>

                    {statuses.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                {visible.map((project) => (
                    <Link
    key={project.project_id}
    to={`/projects/${encodeURIComponent(
        project.project_id
    )}`}
    className="block rounded-xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
>
                        <div className="flex justify-between gap-4">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-zinc-400">
                                    {project.project_id}
                                </div>

                                <h2 className="mt-1 text-lg font-semibold">
                                    {project.apartment_name}
                                </h2>

                                <p className="mt-1 text-sm capitalize text-zinc-500">
                                    {project.locality}
                                </p>
                            </div>

                            <span className="h-fit rounded-full bg-zinc-100 px-3 py-1 text-xs capitalize text-zinc-600">
                                {project.project_status}
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-5 text-sm">
                            <Info
                                label="Developer"
                                value={project.developer_name}
                            />

                            <Info
                                label="Listings"
                                value={project.total_listings}
                            />

                            <Info
                                label="Min area"
                                value={formatArea(
                                    project.min_area_sqft
                                )}
                            />

                            <Info
                                label="Max area"
                                value={formatArea(
                                    project.max_area_sqft
                                )}
                            />

                            <Info
                                label="Min price (API)"
                                value={`₹${Number(
                                    project.price_min
                                ).toLocaleString("en-IN")}`}
                            />

                            <Info
                                label="Max price (API)"
                                value={`₹${Number(
                                    project.price_max
                                ).toLocaleString("en-IN")}`}
                            />
                        </div>
                    </Link>
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

            <div className="mt-1 font-medium text-zinc-800">
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