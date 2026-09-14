import {
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import { logout } from "./services/api";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Saved from "./pages/Saved";
import Rentals from "./pages/Rentals";
import RentalDetail from "./pages/RentalDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Insights from "./pages/Insights";

function ProtectedRoute({
    session,
    children,
}) {
    const location = useLocation();

    if (!session) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location,
                }}
            />
        );
    }

    return children;
}

export default function App({
    session,
    setSession,
}) {
    return (
        <Routes>
            {/* =========================
                LOGIN
            ========================= */}

            <Route
                path="/login"
                element={
                    session ? (
                        <Navigate
                            to="/listings"
                            replace
                        />
                    ) : (
                        <Login
                            onLogin={setSession}
                        />
                    )
                }
            />

            {/* =========================
                PROTECTED APPLICATION
            ========================= */}

            <Route
                path="*"
                element={
                    <ProtectedRoute
                        session={session}
                    >
                        <Layout
    user={session?.user}
    onLogout={async () => {
        await logout();
        setSession(null);
    }}
>
                            <Routes>
                                {/* HOME */}

                                <Route
                                    path="/"
                                    element={
                                        <Navigate
                                            to="/listings"
                                            replace
                                        />
                                    }
                                />

                                {/* LISTINGS */}

                                <Route
                                    path="/listings"
                                    element={
                                        <Listings
                                            user={
                                                session?.user
                                            }
                                        />
                                    }
                                />

                                <Route
                                    path="/listings/:id"
                                    element={
                                        <ListingDetail
                                            user={
                                                session?.user
                                            }
                                        />
                                    }
                                />

                                {/* SAVED */}

                                <Route
                                    path="/saved"
                                    element={
                                        <Saved
                                            user={
                                                session?.user
                                            }
                                        />
                                    }
                                />

                                {/* RENTALS */}

                                <Route
                                    path="/rentals"
                                    element={
                                        <Rentals />
                                    }
                                />

                                <Route
                                    path="/rentals/:id"
                                    element={
                                        <RentalDetail />
                                    }
                                />

                                {/* PROJECTS */}

                                <Route
                                    path="/projects"
                                    element={
                                        <Projects />
                                    }
                                />

                                <Route
                                    path="/projects/:id"
                                    element={
                                        <ProjectDetail />
                                    }
                                />

                                {/* INSIGHTS */}

                                <Route
                                    path="/insights"
                                    element={
                                        <Insights />
                                    }
                                />

                                {/* FALLBACK */}

                                <Route
                                    path="*"
                                    element={
                                        <Navigate
                                            to="/listings"
                                            replace
                                        />
                                    }
                                />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}