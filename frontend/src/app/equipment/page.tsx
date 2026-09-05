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
        
        // Sample equipment data for prototype with multiple regions and photos
        const sampleListings: EquipmentListing[] = [
          {
            id: 1,
            equipment_name: "Mahindra Tractor 575",
            equipment_type: "tractor",
            brand: "Mahindra",
            condition: "good",
            rental_price_per_day: 800,
            rental_price_per_hour: 120,
            distance_km: 8.5,
            primary_photo: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Ludhiana",
              village: "Doraha"
            },
            availability: {
              available_from: "2025-01-15",
              available_until: "2025-06-30"
            },
            owner_id: 1,
            verification_status: "verified",
            view_count: 45
          },
          {
            id: 2,
            equipment_name: "Power Sprayer 100L",
            equipment_type: "sprayer",
            brand: "Honda",
            condition: "excellent",
            rental_price_per_day: 400,
            rental_price_per_hour: 60,
            distance_km: 12.3,
            primary_photo: "https://images.unsplash.com/photo-1563215426-72e26e37685e?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Ludhiana",
              village: "Khanna"
            },
            availability: {
              available_from: "2025-01-10",
              available_until: "2025-05-15"
            },
            owner_id: 2,
            verification_status: "verified",
            view_count: 32
          },
          {
            id: 3,
            equipment_name: "Wheat Harvester",
            equipment_type: "harvester",
            brand: "Kubota",
            condition: "good",
            rental_price_per_day: 1500,
            rental_price_per_hour: 200,
            distance_km: 15.7,
            primary_photo: "https://images.unsplash.com/photo-1574943328924-22af80b0c453?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Ludhiana",
              village: "Jagraon"
            },
            availability: {
              available_from: "2025-04-01",
              available_until: "2025-05-30"
            },
            owner_id: 3,
            verification_status: "pending",
            view_count: 28
          },
          {
            id: 4,
            equipment_name: "John Deere Tractor",
            equipment_type: "tractor",
            brand: "John Deere",
            condition: "excellent",
            rental_price_per_day: 1200,
            rental_price_per_hour: 180,
            distance_km: 22.1,
            primary_photo: "https://images.unsplash.com/photo-1591955663780-acdd4047513f?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Ludhiana",
              village: "Machhiwara"
            },
            availability: {
              available_from: "2025-01-20",
              available_until: "2025-07-15"
            },
            owner_id: 4,
            verification_status: "verified",
            view_count: 67
          },
          {
            id: 5,
            equipment_name: "Manual Sprayer 20L",
            equipment_type: "sprayer",
            brand: "Swaraj",
            condition: "good",
            rental_price_per_day: 150,
            rental_price_per_hour: 25,
            distance_km: 5.8,
            primary_photo: "https://images.unsplash.com/photo-1591410474859-1e2cd2c3e63a?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Ludhiana",
              village: "Doraha"
            },
            availability: {
              available_from: "2025-01-05",
              available_until: "2025-04-20"
            },
            owner_id: 5,
            verification_status: "verified",
            view_count: 23
          },
          {
            id: 6,
            equipment_name: "Eicher Tractor 380",
            equipment_type: "tractor",
            brand: "Eicher",
            condition: "good",
            rental_price_per_day: 600,
            rental_price_per_hour: 90,
            distance_km: 18.4,
            primary_photo: "https://images.unsplash.com/photo-1594886671724-2c8b7a23f7a0?w=400&q=80",
            location: {
              state: "Haryana",
              district: "Karnal",
              village: "Assandh"
            },
            availability: {
              available_from: "2025-02-01",
              available_until: "2025-08-15"
            },
            owner_id: 6,
            verification_status: "verified",
            view_count: 31
          },
          {
            id: 7,
            equipment_name: "Rice Transplanter",
            equipment_type: "harvester",
            brand: "Yanmar",
            condition: "excellent",
            rental_price_per_day: 1800,
            rental_price_per_hour: 250,
            distance_km: 35.2,
            primary_photo: "https://images.unsplash.com/photo-1628151016163-464b995d8e5f?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Amritsar",
              village: "Tarn Taran"
            },
            availability: {
              available_from: "2025-06-01",
              available_until: "2025-07-30"
            },
            owner_id: 7,
            verification_status: "verified",
            view_count: 19
          },
          {
            id: 8,
            equipment_name: "Water Pump 5HP",
            equipment_type: "pump",
            brand: "Kirloskar",
            condition: "good",
            rental_price_per_day: 200,
            rental_price_per_hour: 30,
            distance_km: 7.9,
            primary_photo: "https://images.unsplash.com/photo-1598558940770-4d67b8a86523?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Ludhiana",
              village: "Samrala"
            },
            availability: {
              available_from: "2025-01-01",
              available_until: "2025-12-31"
            },
            owner_id: 8,
            verification_status: "verified",
            view_count: 56
          },
          {
            id: 9,
            equipment_name: "Rotavator 6ft",
            equipment_type: "plow",
            brand: "Fieldking",
            condition: "excellent",
            rental_price_per_day: 350,
            rental_price_per_hour: 50,
            distance_km: 14.6,
            primary_photo: "https://images.unsplash.com/photo-1581092921461-eab62e97a880?w=400&q=80",
            location: {
              state: "Punjab",
              district: "Jalandhar",
              village: "Nakodar"
            },
            availability: {
              available_from: "2025-03-01",
              available_until: "2025-10-30"
            },
            owner_id: 9,
            verification_status: "verified",
            view_count: 41
          },
          {
            id: 10,
            equipment_name: "Swaraj Tractor 855",
            equipment_type: "tractor",
            brand: "Swaraj",
            condition: "good",
            rental_price_per_day: 750,
            rental_price_per_hour: 110,
            distance_km: 28.3,
            primary_photo: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80",
            location: {
              state: "Haryana",
              district: "Panipat",
              village: "Israna"
            },
            availability: {
              available_from: "2025-01-25",
              available_until: "2025-09-20"
            },
            owner_id: 10,
            verification_status: "pending",
            view_count: 22
          }
        ];
        
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
        setCategories([
          { name: "tractor", icon: "🚜", count: 4, min_price: 600, max_price: 1200 },
          { name: "sprayer", icon: "🧴", count: 2, min_price: 150, max_price: 400 },
          { name: "harvester", icon: "🌾", count: 2, min_price: 1500, max_price: 1800 },
          { name: "pump", icon: "💧", count: 1, min_price: 200, max_price: 200 },
          { name: "plow", icon: "🔨", count: 1, min_price: 350, max_price: 350 },
        ]);
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