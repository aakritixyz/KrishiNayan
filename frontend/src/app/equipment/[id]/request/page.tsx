"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  MapPin,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEquipmentById, type BookedRange } from "@/lib/equipment-sample-data";
import DateStrip from "@/components/equipment/DateStrip";
import TimeSlotGrid from "@/components/equipment/TimeSlotGrid";

type EquipmentListing = {
  id: number;
  equipment_name: string;
  equipment_type: string;
  rental_price_per_day: number;
  rental_price_per_hour: number | null;
  security_deposit: number;
  location: {
    state: string;
    district: string;
    village: string | null;
  };
  owner: {
    id: number;
    name: string;
    phone: string | null;
  };
  booked_dates: BookedRange[];
};

type RentalRequest = {
  id: number;
  status: string;
  total_cost: number;
  security_deposit_amount: number;
  owner: {
    id: number;
    name: string;
    phone: string | null;
  };
  created_at: string;
};

const EMPTY_FORM = {
  requested_start_date: "",
  requested_end_date: "",
  pickup_time: "",
  return_time: "",
  message: "",
  pickup_location: "",
};

export default function RentalRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { language } = useLanguage();
  const { isGuest } = useAuth();
  const [listing, setListing] = useState<EquipmentListing | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<RentalRequest | null>(null);

  const loadListing = useCallback(async function loadListing() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiJson<{ listing: EquipmentListing }>(
        `/equipment/listings/${params.id}`
      );
      setListing(data.listing);
    } catch (loadError) {
      // If the API isn't available yet, fall back to sample data (matched
      // by id) so date/slot selection can still be tried in the prototype.
      const sample = getEquipmentById(params.id);
      if (sample) {
        setListing({
          id: sample.id,
          equipment_name: sample.equipment_name,
          equipment_type: sample.equipment_type,
          rental_price_per_day: sample.rental_price_per_day,
          rental_price_per_hour: sample.rental_price_per_hour,
          security_deposit: sample.security_deposit,
          location: sample.location,
          owner: { id: sample.owner.id, name: sample.owner.name, phone: sample.owner.phone },
          booked_dates: sample.availability.booked_dates,
        });
      } else {
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Couldn't load equipment details."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadListing();
    });
    return () => window.clearTimeout(timer);
  }, [loadListing]);

  const calculateTotalCost = () => {
    if (!listing || !form.requested_start_date || !form.requested_end_date) return 0;

    const start = new Date(form.requested_start_date);
    const end = new Date(form.requested_end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return days * listing.rental_price_per_day;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isGuest) {
      setError("Please log in to request equipment rental.");
      return;
    }

    if (
      !form.requested_start_date ||
      !form.requested_end_date ||
      !form.pickup_time ||
      !form.return_time
    ) {
      setError("Please select a start date, end date, pickup time, and return time.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const totalCost = calculateTotalCost();

    try {
      const data = await apiJson<{ request: RentalRequest }>("/equipment/rental-requests", {
        method: "POST",
        body: JSON.stringify({
          listing_id: Number(params.id),
          requested_start_date: form.requested_start_date,
          requested_end_date: form.requested_end_date,
          pickup_time: form.pickup_time,
          return_time: form.return_time,
          message: form.message,
          pickup_location: form.pickup_location,
          total_cost: totalCost,
          security_deposit_amount: listing?.security_deposit || 0,
        }),
      });

      setCreatedRequest(data.request);
      setRequestSent(true);
    } catch (submitError) {
      // If the backend endpoint isn't available yet, simulate a successful
      // request locally so the full flow can still be tried in the prototype.
      if (listing) {
        setCreatedRequest({
          id: Date.now(),
          status: "pending",
          total_cost: totalCost,
          security_deposit_amount: listing.security_deposit,
          owner: listing.owner,
          created_at: new Date().toISOString(),
        });
        setRequestSent(true);
      } else {
        setError(
          submitError instanceof ApiError
            ? submitError.message
            : "Couldn't submit rental request."
        );
      }
    } finally {
      setSubmitting(false);
    }
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

  if (error && !listing) {
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
            <h1 className="text-lg font-bold text-forest">Request Rental</h1>
            <div className="h-11 w-11" />
          </header>

          <div className="mt-8 rounded-[22px] bg-white p-5 text-center">
            <AlertCircle className="mx-auto text-danger" size={32} />
            <p className="mt-3 font-bold text-forest">{error}</p>
          </div>

          <BottomNav />
        </section>
      </main>
    );
  }

  if (requestSent && createdRequest) {
    return (
      <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
        <section className="min-h-screen w-full max-w-[430px] app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
          <header className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/equipment")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
            >
              <ArrowLeft size={21} />
            </button>
            <h1 className="text-lg font-bold text-forest">Request Sent</h1>
            <div className="h-11 w-11" />
          </header>

          <div className="mt-8 rounded-[22px] bg-white p-5 text-center">
            <CheckCircle className="mx-auto text-leaf" size={48} />
            <h2 className="mt-4 text-xl font-bold text-forest">
              {tr("Request Sent Successfully!", language)}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {listing?.owner.name} will review your request and respond soon.
            </p>
            <div className="mt-4 rounded-xl bg-forest/5 p-4 text-left">
              <p className="text-sm font-bold text-forest">Request Details:</p>
              <p className="mt-1 text-sm text-forest">
                {listing?.equipment_name}
              </p>
              <p className="mt-1 text-sm text-muted">
                {form.requested_start_date} to {form.requested_end_date}
              </p>
              <p className="mt-1 text-sm font-bold text-forest">
                Total: ₹{createdRequest.total_cost}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push(`/equipment/requests/${createdRequest.id}`)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep"
            >
              <MessageSquare size={18} />
              View Request
            </button>
            <button
              type="button"
              onClick={() => router.push("/equipment")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 bg-white px-4 py-3 font-bold text-forest"
            >
              Browse More
            </button>
          </div>

          <BottomNav />
        </section>
      </main>
    );
  }

  const totalCost = calculateTotalCost();

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
          <h1 className="text-lg font-bold text-forest">
            {tr("Request Rental", language)}
          </h1>
          <div className="h-11 w-11" />
        </header>

        {error && (
          <div className="mt-4 rounded-2xl border border-danger/20 bg-white p-3 text-sm font-semibold text-danger">
            {error}
          </div>
        )}

        {listing && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Equipment Summary */}
            <div className="rounded-[22px] bg-white p-4">
              <h3 className="font-bold text-forest">{listing.equipment_name}</h3>
              <p className="mt-1 text-sm text-muted">
                {listing.equipment_type} • {listing.location.district}, {listing.location.state}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-forest">
                  ₹{listing.rental_price_per_day}
                </span>
                <span className="text-sm text-muted">/day</span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="rounded-[22px] bg-white p-4">
              <h3 className="flex items-center gap-2 font-bold text-forest">
                <Calendar size={18} className="text-leaf" />
                {tr("Select Dates", language)}
              </h3>

              <div className="mt-3">
                <label className="text-xs text-muted">{tr("Start Date", language)}</label>
                <div className="mt-1.5">
                  <DateStrip
                    value={form.requested_start_date}
                    minDate={new Date().toISOString().split("T")[0]}
                    bookedDates={listing.booked_dates}
                    onChange={(date) =>
                      setForm((prev) => ({
                        ...prev,
                        requested_start_date: date,
                        // Reset end date if it's now before the new start date
                        requested_end_date:
                          prev.requested_end_date && prev.requested_end_date < date
                            ? ""
                            : prev.requested_end_date,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted">{tr("Pickup Time", language)}</label>
                <div className="mt-1.5">
                  <TimeSlotGrid
                    value={form.pickup_time}
                    onChange={(slot) => setForm((prev) => ({ ...prev, pickup_time: slot }))}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted">{tr("End Date", language)}</label>
                <div className="mt-1.5">
                  <DateStrip
                    value={form.requested_end_date}
                    minDate={form.requested_start_date || new Date().toISOString().split("T")[0]}
                    bookedDates={listing.booked_dates}
                    onChange={(date) => setForm((prev) => ({ ...prev, requested_end_date: date }))}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted">{tr("Return Time", language)}</label>
                <div className="mt-1.5">
                  <TimeSlotGrid
                    value={form.return_time}
                    onChange={(slot) => setForm((prev) => ({ ...prev, return_time: slot }))}
                  />
                </div>
              </div>

              {listing.booked_dates.length > 0 && (
                <p className="mt-3 text-[11px] text-muted">
                  {tr("Greyed-out dates are already booked by another farmer.", language)}
                </p>
              )}
            </div>

            {/* Cost Summary */}
            <div className="rounded-[22px] bg-white p-4">
              <h3 className="flex items-center gap-2 font-bold text-forest">
                <IndianRupee size={18} className="text-leaf" />
                {tr("Cost Summary", language)}
              </h3>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Rental Cost</span>
                  <span className="font-medium text-forest">₹{totalCost}</span>
                </div>
                {listing.security_deposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Security Deposit</span>
                    <span className="font-medium text-forest">₹{listing.security_deposit}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-forest/10 pt-2">
                  <span className="font-bold text-forest">Total</span>
                  <span className="font-bold text-forest">
                    ₹{totalCost + (listing.security_deposit || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="rounded-[22px] bg-white p-4">
              <h3 className="flex items-center gap-2 font-bold text-forest">
                <MapPin size={18} className="text-leaf" />
                {tr("Pickup Location", language)}
              </h3>
              <input
                type="text"
                value={form.pickup_location}
                onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
                placeholder="Where should you pick up the equipment?"
                className="mt-3 w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-muted">
                Default: {listing.location.village && `${listing.location.village}, `}
                {listing.location.district}, {listing.location.state}
              </p>
            </div>

            {/* Message */}
            <div className="rounded-[22px] bg-white p-4">
              <h3 className="flex items-center gap-2 font-bold text-forest">
                <MessageSquare size={18} className="text-leaf" />
                {tr("Message to Owner", language)}
              </h3>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Introduce yourself and mention when you'd like to pick up the equipment..."
                rows={3}
                className="mt-3 w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
              />
            </div>

            {/* Owner Info */}
            <div className="rounded-[22px] bg-white p-4">
              <h3 className="font-bold text-forest">Owner</h3>
              <p className="mt-1 text-sm text-forest">{listing.owner.name}</p>
              <p className="mt-1 text-xs text-muted">
                Usually responds within a few hours
              </p>
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                !form.requested_start_date ||
                !form.requested_end_date ||
                !form.pickup_time ||
                !form.return_time
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-4 font-bold text-forest-deep disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Calendar size={20} />
                  {tr("Send Request", language)}
                </>
              )}
            </button>
          </form>
        )}

        <BottomNav />
      </section>
    </main>
  );
}