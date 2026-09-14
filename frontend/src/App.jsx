import {
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Saved from "./pages/Saved";
import Rentals from "./pages/Rentals";
import Projects from "./pages/Projects";
import Insights from "./pages/Insights";

function ProtectedRoute({ session, children }) {
    const location = useLocation();

    if (!session) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
}

export default function App({ session, setSession }) {
    return (
        <Routes>
            {/* Login */}
            <Route
                path="/login"
                element={
                    session ? (
                        <Navigate
                            to="/listings"
                            replace
                        />
                    ) : (
                        <Login onLogin={setSession} />
                    )
                }
            />

            {/* Everything else requires authentication */}
            <Route
                path="*"
                element={
                    <ProtectedRoute session={session}>
                        <Layout user={session?.user}>
                            <Routes>
                                {/* Default route */}
                                <Route
                                    path="/"
                                    element={
                                        <Navigate
                                            to="/listings"
                                            replace
                                        />
                                    }
                                />

                                {/* Listings */}
                                <Route
                                    path="/listings"
                                    element={
                                        <Listings
                                            user={session?.user}
                                        />
                                    }
                                />

                                {/* Listing detail */}
                                <Route
                                    path="/listings/:id"
                                    element={
                                        <ListingDetail />
                                    }
                                />

                                {/* Saved */}
                                <Route
                                    path="/saved"
                                    element={
                                        <Saved
                                            user={session?.user}
                                        />
                                    }
                                />

                                {/* Rentals */}
                                <Route
                                    path="/rentals"
                                    element={<Rentals />}
                                />

                                {/* Projects */}
                                <Route
                                    path="/projects"
                                    element={<Projects />}
                                />

                                {/* Insights */}
                                <Route
                                    path="/insights"
                                    element={<Insights />}
                                />

                                {/* Unknown route */}
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