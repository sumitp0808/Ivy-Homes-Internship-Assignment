import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const session = await login(email, password);

            onLogin(session);

            const destination =
                location.state?.from?.pathname ||
                "/listings";

            navigate(destination, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-5">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center text-white">
                    <div className="text-3xl font-bold tracking-tight">
                        Ivy Homes
                    </div>

                    <p className="mt-2 text-sm text-zinc-400">
                        Sign in to explore your property dataset
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl bg-white p-7 shadow-2xl"
                >
                    <h1 className="text-xl font-semibold text-zinc-900">
                        Sign in
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Use your assigned Ivy Homes demo credentials.
                    </p>

                    {error && (
                        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-zinc-700">
                                Email
                            </span>

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3.5 py-3 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                                placeholder="demo3@ivy.homes"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-zinc-700">
                                Password
                            </span>

                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3.5 py-3 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </label>
                    </div>

                    <button
                        disabled={loading}
                        className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}