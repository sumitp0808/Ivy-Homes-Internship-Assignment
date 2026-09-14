import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import {
    getSavedListings,
    removeSavedListing,
} from "../services/saved";

export default function Saved({ user }) {
    const [savedListings, setSavedListings] = useState([]);

    useEffect(() => {
        if (!user?.email) {
            setSavedListings([]);
            return;
        }

        setSavedListings(
            getSavedListings(user.email)
        );
    }, [user?.email]);

    function removeListing(listing) {
        const updated = removeSavedListing(
            user.email,
            listing.listing_id
        );

        setSavedListings(updated);
    }

    if (!user?.email) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Your collection
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
                    Saved listings
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                    Properties you've saved for later.
                </p>
            </div>

            {savedListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-14 text-center">
                    <div className="text-4xl text-zinc-300">
                        ♡
                    </div>

                    <h2 className="mt-4 font-semibold text-zinc-900">
                        Nothing saved yet
                    </h2>

                    <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
                        Save listings while browsing and they'll
                        appear here. Your saved properties are
                        stored separately for this account.
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-500">
                            {savedListings.length}{" "}
                            {savedListings.length === 1
                                ? "property"
                                : "properties"}
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {savedListings.map((listing) => (
                            <ListingCard
                                key={listing.listing_id}
                                listing={listing}
                                saved={true}
                                onToggleSave={removeListing}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}