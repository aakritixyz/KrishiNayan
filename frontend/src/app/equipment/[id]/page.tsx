"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  Calendar,
  Star,
  Shield,
  MessageCircle,
  Phone,
  Share2,
  Heart,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getEquipmentById } from "@/lib/equipment-sample-data";
import PhotoGallery from "@/components/equipment/PhotoGallery";

type EquipmentListing = {
  id: number;
  equipment_name: string;
  equipment_type: string;
  brand: string | null;
  model: string | null;
  year_manufactured: number | null;
  condition: string;
  rental_price_per_day: number;
  rental_price_per_hour: number | null;
  security_deposit: number;
  location: {
    state: string;
    district: string;
    village: string | null;
    latitude: number;
    longitude: number;
    description: string | null;
  };
  availability: {
    is_available: boolean;
    available_from: string;
    available_until: string | null;
    booked_dates: Array<{ start: string; end: string }>;
  };
  photos: string[];
  primary_photo: string | null;
  description: string | null;
  specifications: Record<string, string> | null;
  owner: {
    id: number;
    name: string;
    trust_score: number;
    phone_verified: boolean;
    response_time_hours: number | null;
    total_listings: number;
    successful_rentals: number;
  };
  reviews: {
    average_rating: number;
    total_reviews: number;
    recent_reviews: Array<{
      id: number;
      reviewer_name: string;
      overall_rating: number;
      title: string | null;
      comment: string | null;
      created_at: string;
    }>;
  };
  created_at: string;
};

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { language } = useLanguage();
  const { isGuest } = useAuth();
  const [listing, setListing] = useState<EquipmentListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { id } = use(params);

  const loadListing = useCallback(async function loadListing() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiJson<{ listing: EquipmentListing }>(
        `/equipment/listings/${id}`
      );
      setListing(data.listing);
    } catch (loadError) {
      // If API endpoint doesn't exist yet, use sample data for prototype,
      // matched by id so every listing shows its own real details/photos.
      console.log("Equipment detail API not available yet, using sample data");

      const sample = getEquipmentById(id);

      if (!sample) {
        setError("Equipment not found");
        setListing(null);
        return;
      }

      setListing({
        id: sample.id,
        equipment_name: sample.equipment_name,
        equipment_type: sample.equipment_type,
        brand: sample.brand,
        model: sample.model,
        year_manufactured: sample.year_manufactured,
        condition: sample.condition,
        rental_price_per_day: sample.rental_price_per_day,
        rental_price_per_hour: sample.rental_price_per_hour,
        security_deposit: sample.security_deposit,
        location: sample.location,
        availability: {
          is_available: sample.availability.is_available,
          available_from: sample.availability.available_from,
          available_until: sample.availability.available_until,
          booked_dates: sample.availability.booked_dates,
        },
        photos: sample.photos,
        primary_photo: sample.photos[0] ?? null,
        description: sample.description,
        specifications: sample.specifications,
        owner: sample.owner,
        reviews: sample.reviews,
        created_at: sample.created_at,
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadListing();
    });
    return () => window.clearTimeout(timer);
  }, [loadListing]);

  const handleRequestRental = () => {
    if (isGuest) {
      setError("Please log in to request equipment rental.");
      return;
    }
    setShowRequestModal(true);
  };

  if (loading) {
    return (
      <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
        <section className="flex min-h-screen w-full max-w-[430px] items-center justify-center app-frame bg-cream px-5 sm:min-h-[844px] sm:rounded-[36px]">
          <Loader2 size={32} className="animate-spin text-leaf" />
        </section>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
        <section className="min-h-screen w-full max-w-[430px] app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
          <header className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
            >
              <ArrowLeft size={21} />
            </button>
            <h1 className="text-lg font-bold text-forest">Equipment Details</h1>
            <div className="h-11 w-11" />
          </header>

          <div className="mt-8 rounded-[22px] bg-white p-5 text-center">
            <AlertCircle className="mx-auto text-danger" size={32} />
            <p className="mt-3 font-bold text-forest">
              {error || "Equipment not found"}
            </p>
          </div>

          <BottomNav />
        </section>
      </main>
    );
  }

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
            aria-label={tr("Go back", language)}
          >
            <ArrowLeft size={21} />
          </button>
          <h1 className="text-lg font-bold text-forest">{listing.equipment_name}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
            >
              <Heart
                size={18}
                className={isFavorite ? "fill-danger text-danger" : ""}
              />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
            >
              <Share2 size={18} />
            </button>
          </div>
        </header>

        {/* Photo Gallery */}
        <PhotoGallery photos={listing.photos} alt={listing.equipment_name} />

        {/* Price & Rating */}
        <div className="mt-4 flex items-center justify-between rounded-[22px] bg-white p-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-forest">
                ₹{listing.rental_price_per_day}
              </span>
              <span className="text-sm text-muted">/day</span>
              {listing.rental_price_per_hour && (
                <>
                  <span className="text-sm text-muted">or</span>
                  <span className="font-bold text-forest">
                    ₹{listing.rental_price_per_hour}
                  </span>
                  <span className="text-sm text-muted">/hr</span>
                </>
              )}
            </div>
            {listing.security_deposit > 0 && (
              <p className="mt-1 text-xs text-muted">
                Security deposit: ₹{listing.security_deposit}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-warning text-warning" />
            <span className="font-bold text-forest">
              {listing.reviews.average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted">
              ({listing.reviews.total_reviews})
            </span>
          </div>
        </div>

        {/* Owner Info */}
        <div className="mt-4 rounded-[22px] bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf/10 text-leaf font-bold">
                {listing.owner.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-forest">{listing.owner.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Shield size={12} className="text-leaf" />
                  <span>Trust Score: {listing.owner.trust_score}</span>
                  {listing.owner.phone_verified && (
                    <span className="text-leaf">✓ Verified</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/5 text-forest"
              >
                <MessageCircle size={18} />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/5 text-forest"
              >
                <Phone size={18} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span>{listing.owner.total_listings} listings</span>
            <span>{listing.owner.successful_rentals} rentals</span>
            {listing.owner.response_time_hours && (
              <span>~{listing.owner.response_time_hours}h response</span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mt-4 rounded-[22px] bg-white p-4">
          <h3 className="flex items-center gap-2 font-bold text-forest">
            <MapPin size={18} className="text-leaf" />
            Location
          </h3>
          <p className="mt-2 text-sm text-forest">
            {listing.location.village && `${listing.location.village}, `}
            {listing.location.district}, {listing.location.state}
          </p>
          {listing.location.description && (
            <p className="mt-1 text-xs text-muted">{listing.location.description}</p>
          )}
        </div>

        {/* Availability */}
        <div className="mt-4 rounded-[22px] bg-white p-4">
          <h3 className="flex items-center gap-2 font-bold text-forest">
            <Calendar size={18} className="text-leaf" />
            Availability
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              listing.availability.is_available
                ? "bg-leaf/10 text-leaf"
                : "bg-danger/10 text-danger"
            }`}>
              {listing.availability.is_available ? "Available" : "Not Available"}
            </span>
          </div>
          <p className="mt-2 text-sm text-forest">
            From: {new Date(listing.availability.available_from).toLocaleDateString()}
            {listing.availability.available_until && (
              <> Until: {new Date(listing.availability.available_until).toLocaleDateString()}</>
            )}
          </p>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mt-4 rounded-[22px] bg-white p-4">
            <h3 className="font-bold text-forest">Description</h3>
            <p className="mt-2 text-sm text-forest">{listing.description}</p>
          </div>
        )}

        {/* Specifications */}
        {listing.specifications && Object.keys(listing.specifications).length > 0 && (
          <div className="mt-4 rounded-[22px] bg-white p-4">
            <h3 className="font-bold text-forest">Specifications</h3>
            <div className="mt-2 space-y-2">
              {Object.entries(listing.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-medium text-forest">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {listing.reviews.recent_reviews.length > 0 && (
          <div className="mt-4 rounded-[22px] bg-white p-4">
            <h3 className="font-bold text-forest">Recent Reviews</h3>
            <div className="mt-3 space-y-3">
              {listing.reviews.recent_reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b border-forest/10 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-forest">{review.reviewer_name}</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-warning text-warning" />
                      <span className="text-sm">{review.overall_rating}</span>
                    </div>
                  </div>
                  {review.title && (
                    <p className="mt-1 text-sm font-medium text-forest">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="mt-1 text-xs text-muted">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleRequestRental}
            disabled={!listing.availability.is_available}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-4 font-bold text-forest-deep disabled:opacity-50"
          >
            {listing.availability.is_available ? (
              <>
                <Calendar size={20} />
                {tr("Request Rental", language)}
              </>
            ) : (
              <>
                <AlertCircle size={20} />
                Currently Unavailable
              </>
            )}
          </button>
        </div>

        {/* Rental Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-[22px] bg-white p-6">
              <h2 className="text-lg font-bold text-forest">Request Rental</h2>
              <p className="mt-2 text-sm text-muted">
                {listing.equipment_name} - ₹{listing.rental_price_per_day}/day
              </p>
              <button
                type="button"
                onClick={() => router.push(`/equipment/${listing.id}/request`)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep"
              >
                <Calendar size={18} />
                Select Dates & Request
              </button>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="mt-2 w-full rounded-2xl border border-forest/15 py-3 font-medium text-forest"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </section>
    </main>
  );
}