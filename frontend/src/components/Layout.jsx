import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/api";

const navigation = [
    {
        label: "Listings",
        path: "/listings",
        icon: "⌂",
    },
    {
        label: "Saved",
        path: "/saved",
        icon: "♡",
    },
    {
        label: "Rentals",
        path: "/rentals",
        icon: "₹",
    },
    {
        label: "Projects",
        path: "/projects",
        icon: "▦",
    },
    {
        label: "Insights",
        path: "/insights",
        icon: "◈",
    },
];

export default function Layout({ children, user }) {
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white lg:block">
                <div className="flex h-full flex-col">
                    <div className="border-b border-zinc-200 px-6 py-6">
                        <div className="text-xl font-bold tracking-tight">
                            Ivy Homes
                        </div>

                        <div className="mt-1 text-xs text-zinc-500">
                            Property intelligence
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-zinc-900 text-white"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    }`
                                }
                            >
                                <span className="w-5 text-center">
                                    {item.icon}
                                </span>

                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="border-t border-zinc-200 p-4">
                        <div className="mb-3 truncate px-2 text-xs text-zinc-500">
                            {user?.email}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            <main className="lg:pl-64">
                <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
                    <div className="flex items-center justify-between px-5 py-4 lg:px-8">
                        <div>
                            <div className="text-sm font-semibold text-zinc-900">
                                Property Explorer
                            </div>

                            <div className="text-xs text-zinc-500">
                                Your Ivy Homes city dataset
                            </div>
                        </div>

                        <div className="text-xs text-zinc-500">
                            {user?.email}
                        </div>
                    </div>

                    <div className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-4 py-2 lg:hidden">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium ${
                                        isActive
                                            ? "bg-zinc-900 text-white"
                                            : "text-zinc-600"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </header>

                <div className="p-5 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}