"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";
import {
  Search,
  MapPin,
  Filter,
  Tractor,
  Wrench,
  Wheat,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_EQUIPMENT, EQUIPMENT_CATEGORY_SUMMARY } from "@/lib/equipment-sample-data";

type EquipmentListing = {
  id: number;
  equipment_name: string;
  equipment_type: string;
  brand: string | null;
  condition: string;
  rental_price_per_day: number;
  rental_price_per_hour: number | null;
  distance_km: number;
  primary_photo: string | null;
  location: {
    state: string;
    district: string;
    village: string | null;
  };
  availability: {
    available_from: string | null;
    available_until: string | null;
  };
  owner_id: number;
  verification_status: string;
  view_count: number;
};

type EquipmentCategory = {
  name: string;
  icon: string;
  count: number;
  min_price: number;
  max_price: number;
};

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
  tractor: <Tractor size={24} />,
  harvester: <Wheat size={24} />,
  sprayer: <Wrench size={24} />,
  sensor: <AlertCircle size={24} />,
  plow: <Tractor size={24} />,
  pump: <Wrench size={24} />,
  cultivator: <Tractor size={24} />,
  thresher: <Wheat size={24} />,
};

export default function EquipmentPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isGuest } = useAuth();
  const [listings, setListings] = useState<EquipmentListing[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const loadEquipment = useCallback(async function loadEquipment() {
    if (isGuest) {
      setListings([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to get user location, but use default if it fails
      let currentLat = 30.9330; // Default to Punjab
      let currentLon = 75.8527;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          currentLat = position.coords.latitude;
          currentLon = position.coords.longitude;
          setUserLocation({ lat: currentLat, lon: currentLon });
        } catch (geoError) {
          console.log("Geolocation failed, using default location");
          setUserLocation({ lat: currentLat, lon: currentLon });
        }
      }

      // Search for equipment
      const params = new URLSearchParams({
        radius_km: radius.toString(),
        latitude: currentLat.toString(),
        longitude: currentLon.toString(),
      });

      if (selectedCategory) {
        params.append("equipment_type", selectedCategory);
      }

      try {
        const data = await apiJson<{ listings: EquipmentListing[] }>(
          `/equipment/listings/search?${params.toString()}`
        );
        setListings(data.listings);
      } catch (apiError) {
        // If API endpoint doesn't exist yet, use sample data for prototype
        console.log("Equipment API not available yet, using sample data");

        const sampleListings: EquipmentListing[] = SAMPLE_EQUIPMENT.map((item) => ({
          id: item.id,
          equipment_name: item.equipment_name,
          equipment_type: item.equipment_type,
          brand: item.brand,
          condition: item.condition,
          rental_price_per_day: item.rental_price_per_day,
          rental_price_per_hour: item.rental_price_per_hour,
          distance_km: item.distance_km,
          primary_photo: item.photos[0] ?? null,
          location: {
            state: item.location.state,
            district: item.location.district,
            village: item.location.village,
          },
          availability: {
            available_from: item.availability.available_from,
            available_until: item.availability.available_until,
          },
          owner_id: item.owner.id,
          verification_status: item.verification_status,
          view_count: item.view_count,
        }));

        // Filter by category if selected
        const filteredListings = selectedCategory 
          ? sampleListings.filter(listing => listing.equipment_type === selectedCategory)
          : sampleListings;
        
        setListings(filteredListings);
      }

      try {
        // Load categories summary
        const categoryData = await apiJson<{ categories: EquipmentCategory[] }>(
          `/equipment/categories/summary?latitude=${currentLat}&longitude=${currentLon}&radius_km=${radius}`
        );
        setCategories(categoryData.categories);
      } catch (categoryError) {
        // If categories API doesn't exist, use sample data with updated counts
        console.log("Categories API not available yet, using sample data");
        setCategories(EQUIPMENT_CATEGORY_SUMMARY);
      }

    } catch (loadError) {
      console.error("Error loading equipment:", loadError);
      // Don't show error for missing backend - just show empty state
      setListings([]);
      setCategories([
        { name: "tractor", icon: "🚜", count: 0, min_price: 0, max_price: 0 },
        { name: "sprayer", icon: "🧴", count: 0, min_price: 0, max_price: 0 },
        { name: "harvester", icon: "🌾", count: 0, min_price: 0, max_price: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [isGuest, radius, selectedCategory]);

  useEffect(() => {
    // Set default location immediately on mount
    setUserLocation({ lat: 30.9330, lon: 75.8527 });
  }, []); // Run once on mount

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEquipment();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadEquipment]);

  const filteredListings = listings.filter(listing =>
    listing.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tractor size={24} className="text-leaf" />
            <h1 className="text-lg font-bold text-forest">
              {tr("Equipment Rental", language)}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/equipment/create")}
            className="flex items-center gap-2 rounded-full bg-leaf px-4 py-2 font-bold text-forest-deep"
          >
            <span>+ List</span>
          </button>
        </header>

        {error && (
          <div className="mt-4 rounded-2xl border border-danger/20 bg-white p-3 text-sm font-semibold text-danger">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr("Search equipment...", language)}
              className="w-full rounded-xl border border-forest/15 bg-white py-3 pl-10 pr-4 text-sm"
            />
          </div>
          <button className="flex items-center justify-center rounded-xl border border-forest/15 bg-white px-3">
            <Filter size={18} className="text-forest" />
          </button>
        </div>

        {/* Location & Radius */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white p-3">
          <MapPin size={18} className="text-leaf" />
          <span className="flex-1 text-sm text-forest">
            {userLocation ? "Using your location" : "Punjab, India"}
          </span>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="rounded-lg border border-forest/15 bg-forest/5 px-2 py-1 text-sm"
          >
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
          </select>
        </div>

        {/* Equipment Categories */}
        <div className="mt-5">
          <h2 className="text-sm font-bold text-forest mb-3">
            {tr("Categories", language)}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === null
                  ? "bg-leaf text-forest-deep"
                  : "bg-white text-forest"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setSelectedCategory(category.name)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                  selectedCategory === category.name
                    ? "bg-leaf text-forest-deep"
                    : "bg-white text-forest"
                }`}
              >
                <span className="flex items-center gap-1">
                  {EQUIPMENT_ICONS[category.name] || <Tractor size={16} />}
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  <span className="text-xs opacity-70">({category.count})</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Listings */}
        <div className="mt-5">
          <h2 className="text-sm font-bold text-forest mb-3">
            {tr("Nearby Equipment", language)}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-leaf" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-[22px] bg-white p-5 text-center">
              <Tractor className="mx-auto text-muted" size={30} />
              <p className="mt-3 font-bold text-forest">No equipment found</p>
              <p className="mt-1 text-sm text-muted">
                Try increasing the search radius or check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => router.push(`/equipment/${listing.id}`)}
                  className="w-full rounded-[22px] border border-forest/10 bg-white p-4 text-left transition hover:border-leaf/30"
                >
                  <div className="flex gap-3">
                    <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-forest/5 flex items-center justify-center overflow-hidden">
                      {listing.primary_photo ? (
                        <img
                          src={listing.primary_photo}
                          alt={listing.equipment_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">
                          {EQUIPMENT_ICONS[listing.equipment_type] || <Tractor size={32} />}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-muted">
                            {listing.equipment_type}
                          </p>
                          <h3 className="mt-1 font-bold text-forest">
                            {listing.equipment_name}
                          </h3>
                        </div>
                        <span className="rounded-full bg-leaf/10 px-2 py-1 text-xs font-bold text-leaf">
                          {listing.distance_km} km
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="font-bold text-forest">
                          ₹{listing.rental_price_per_day}/day
                        </span>
                        {listing.rental_price_per_hour && (
                          <span className="text-muted">
                            or ₹{listing.rental_price_per_hour}/hr
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <MapPin size={12} />
                        {listing.location.district}, {listing.location.state}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </section>
    </main>
  );
}