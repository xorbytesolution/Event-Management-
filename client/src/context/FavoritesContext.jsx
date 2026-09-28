import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync favorites whenever user object changes
  useEffect(() => {
    if (user && Array.isArray(user.favorites)) {
      setFavoriteIds(
        user.favorites.map((fav) => (typeof fav === "object" ? fav._id : fav)),
      );
    } else {
      setFavoriteIds([]);
    }
  }, [user]);

  /**
   * Check if an event is currently favorited
   */
  const isFavorite = (eventId) => {
    if (!eventId) return false;
    const idStr = String(eventId);
    return favoriteIds.some((id) => String(id) === idStr);
  };

  /**
   * Show notification warning with direct Login & Register action buttons for unauthenticated visitors
   */
  const showUnauthPrompt = (navigate, fromPath = "/") => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } w-full max-w-sm rounded-xl border border-amber-300 bg-white p-4 shadow-xl pointer-events-auto transition-all`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm font-bold">
                ♡
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Login to Save Favorites
              </h4>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 font-bold text-base leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Please log in as an Exhibitor or Organizer to save events to your
            favorites list.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (navigate) {
                  navigate("/login", { state: { from: fromPath } });
                } else {
                  window.location.href = "/login";
                }
              }}
              className="rounded-lg bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-orange-700 shadow-xs"
            >
              Log In
            </button>

            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (navigate) {
                  navigate("/registration", { state: { from: fromPath } });
                } else {
                  window.location.href = "/registration";
                }
              }}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Register
            </button>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-auto text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" },
    );
  };

  /**
   * Toggle favorite status of an event
   */
  const toggleFavorite = async (eventId, navigate, fromPath = "/") => {
    if (!isAuthenticated) {
      showUnauthPrompt(navigate, fromPath);
      return false;
    }

    const idStr = String(eventId);
    const wasFavorite = isFavorite(idStr);

    // Optimistic UI update: immediately toggle in local state
    const nextFavoriteIds = wasFavorite
      ? favoriteIds.filter((id) => String(id) !== idStr)
      : [...favoriteIds, idStr];

    setFavoriteIds(nextFavoriteIds);

    // Also optimistically update user in AuthContext
    if (updateUser) {
      updateUser({ favorites: nextFavoriteIds });
    }

    try {
      const { data } = await api.post(`/favorites/toggle/${idStr}`);

      if (data?.message) {
        if (data.isFavorite) {
          toast.success(data.message, { id: `fav-${idStr}`, icon: "❤️" });
        } else {
          toast.success(data.message, { id: `fav-${idStr}`, icon: "💔" });
        }
      }

      if (data?.favorites) {
        const syncedIds = data.favorites.map((fav) =>
          typeof fav === "object" ? fav._id : fav,
        );
        setFavoriteIds(syncedIds);
        if (updateUser) {
          updateUser({ favorites: syncedIds });
        }
      }

      return data?.isFavorite;
    } catch (err) {
      // Rollback on failure
      setFavoriteIds(favoriteIds);
      if (updateUser) {
        updateUser({ favorites: favoriteIds });
      }

      const errMsg =
        err.response?.data?.message ||
        "Could not update favorites. Please try again.";
      toast.error(errMsg);
      return wasFavorite;
    }
  };

  /**
   * Fetch full favorited events (for FavoritesPage)
   */
  const fetchFavorites = async () => {
    if (!isAuthenticated) return [];

    setLoading(true);
    try {
      const { data } = await api.get("/favorites");
      const list = data?.favorites || [];
      const ids = list.map((item) => item._id || item);
      setFavoriteIds(ids);
      return list;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    favoriteIds,
    favoritesCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    fetchFavorites,
    loading,
    showUnauthPrompt,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
