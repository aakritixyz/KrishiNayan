import { Shield, Star, CheckCircle, Clock, Award, Users } from "lucide-react";

type TrustProfileProps = {
  trustScore: number;
  ratings: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: {
      overall: number;
      equipment_condition: number;
      communication: number;
      punctuality: number;
      value: number;
    };
  };
  activity: {
    totalListings: number;
    totalRentalsAsOwner: number;
    totalRentalsAsRenter: number;
    successfulCompletions: number;
    cancellations: number;
  };
  verification: {
    identityVerified: boolean;
    phoneVerified: boolean;
    equipmentVerifiedCount: number;
  };
  badges: string[];
};

export default function TrustProfile({
  trustScore,
  ratings,
  activity,
  verification,
  badges,
}: TrustProfileProps) {
  const getTrustLevel = (score: number) => {
    if (score >= 90) return { label: "Elite", color: "text-leaf", bgColor: "bg-leaf/10" };
    if (score >= 75) return { label: "Trusted", color: "text-leaf", bgColor: "bg-leaf/10" };
    if (score >= 60) return { label: "Reliable", color: "text-warning", bgColor: "bg-warning/10" };
    return { label: "New", color: "text-muted", bgColor: "bg-forest/5" };
  };

  const trustLevel = getTrustLevel(trustScore);

  return (
    <div className="rounded-[22px] bg-white p-4">
      {/* Trust Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf/10 text-leaf">
            <Shield size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-forest">{trustScore}</span>
              <span className="text-sm text-muted">/100</span>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-bold ${trustLevel.color} ${trustLevel.bgColor}`}
            >
              {trustLevel.label}
            </span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-1 rounded-full bg-forest/5 px-3 py-1 text-xs font-medium text-forest"
            >
              <Award size={12} className="text-leaf" />
              {badge.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          ))}
        </div>
      )}

      {/* Ratings Breakdown */}
      <div className="mt-4">
        <h4 className="flex items-center gap-2 text-sm font-bold text-forest">
          <Star size={16} className="fill-warning text-warning" />
          Ratings
        </h4>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-forest/5 p-2">
            <p className="text-xs text-muted">Overall</p>
            <p className="text-lg font-bold text-forest">{ratings.ratingBreakdown.overall.toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-forest/5 p-2">
            <p className="text-xs text-muted">Reviews</p>
            <p className="text-lg font-bold text-forest">{ratings.totalReviews}</p>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Equipment</span>
            <span className="font-medium text-forest">
              {ratings.ratingBreakdown.equipment_condition.toFixed(1)}/5
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Communication</span>
            <span className="font-medium text-forest">
              {ratings.ratingBreakdown.communication.toFixed(1)}/5
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Punctuality</span>
            <span className="font-medium text-forest">
              {ratings.ratingBreakdown.punctuality.toFixed(1)}/5
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Value</span>
            <span className="font-medium text-forest">
              {ratings.ratingBreakdown.value.toFixed(1)}/5
            </span>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="mt-4">
        <h4 className="flex items-center gap-2 text-sm font-bold text-forest">
          <Users size={16} className="text-leaf" />
          Activity
        </h4>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-forest/5 p-2">
            <p className="text-xs text-muted">Listings</p>
            <p className="text-lg font-bold text-forest">{activity.totalListings}</p>
          </div>
          <div className="rounded-xl bg-forest/5 p-2">
            <p className="text-xs text-muted">Rentals</p>
            <p className="text-lg font-bold text-forest">
              {activity.totalRentalsAsOwner + activity.totalRentalsAsRenter}
            </p>
          </div>
          <div className="rounded-xl bg-forest/5 p-2">
            <p className="text-xs text-muted">Completed</p>
            <p className="text-lg font-bold text-forest">{activity.successfulCompletions}</p>
          </div>
          <div className="rounded-xl bg-forest/5 p-2">
            <p className="text-xs text-muted">Cancelled</p>
            <p className="text-lg font-bold text-forest">{activity.cancellations}</p>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="mt-4">
        <h4 className="flex items-center gap-2 text-sm font-bold text-forest">
          <CheckCircle size={16} className="text-leaf" />
          Verification
        </h4>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-forest/5 p-2">
            <span className="text-xs text-muted">Identity</span>
            <span
              className={`text-xs font-bold ${
                verification.identityVerified ? "text-leaf" : "text-muted"
              }`}
            >
              {verification.identityVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-forest/5 p-2">
            <span className="text-xs text-muted">Phone</span>
            <span
              className={`text-xs font-bold ${
                verification.phoneVerified ? "text-leaf" : "text-muted"
              }`}
            >
              {verification.phoneVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-forest/5 p-2">
            <span className="text-xs text-muted">Equipment Verified</span>
            <span className="text-xs font-bold text-forest">
              {verification.equipmentVerifiedCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}