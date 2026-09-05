// Sample/offline data for the Equipment Rental feature.
//
// Used as a fallback whenever the backend API isn't reachable yet, so the
// feature is fully browsable in prototype/demo mode. All photos below are
// real photographs (not icons/illustrations), sourced from Unsplash and
// verified to resolve, grouped by equipment category so each listing shows
// a photo that actually matches what it is renting out.

export type EquipmentPhoto = string;

export type BookedRange = { start: string; end: string };

export type EquipmentOwner = {
  id: number;
  name: string;
  trust_score: number;
  phone_verified: boolean;
  phone: string | null;
  response_time_hours: number | null;
  total_listings: number;
  successful_rentals: number;
};

export type EquipmentReview = {
  id: number;
  reviewer_name: string;
  overall_rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
};

export type SampleEquipment = {
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
  distance_km: number;
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
    booked_dates: BookedRange[];
  };
  photos: EquipmentPhoto[];
  description: string;
  specifications: Record<string, string>;
  owner: EquipmentOwner;
  reviews: {
    average_rating: number;
    total_reviews: number;
    recent_reviews: EquipmentReview[];
  };
  verification_status: string;
  view_count: number;
  created_at: string;
};

// Real, category-matched photo pools (verified Unsplash CDN URLs).
// Multiple angles/scenes per category so each listing gets its own gallery.
const PHOTOS = {
  tractorField: "https://images.unsplash.com/photo-1666015886464-7024656736e8?w=900&q=80",
  tractorDriving: "https://images.unsplash.com/photo-1684677806708-f528f4950ad4?w=900&q=80",
  tractorPlow: "https://images.unsplash.com/photo-1780332514648-516e9dad94c6?w=900&q=80",
  boomSprayer: "https://images.unsplash.com/photo-1654741275609-d7861db288c2?w=900&q=80",
  handSprayer: "https://images.unsplash.com/photo-1749030417784-f8abf669dd41?w=900&q=80",
  combineHarvester: "https://images.unsplash.com/photo-1760299092531-65343a514b86?w=900&q=80",
  irrigationPump: "https://images.unsplash.com/photo-1692369584496-3216a88f94c1?w=900&q=80",
} as const;

export const SAMPLE_EQUIPMENT: SampleEquipment[] = [
  {
    id: 1,
    equipment_name: "Mahindra Tractor 575",
    equipment_type: "tractor",
    brand: "Mahindra",
    model: "575 DI",
    year_manufactured: 2020,
    condition: "good",
    rental_price_per_day: 800,
    rental_price_per_hour: 120,
    security_deposit: 2000,
    distance_km: 8.5,
    location: {
      state: "Punjab",
      district: "Ludhiana",
      village: "Doraha",
      latitude: 30.933,
      longitude: 75.8527,
      description: "Near village temple, main road",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2026-12-31",
      booked_dates: [
        { start: "2026-09-10", end: "2026-09-12" },
        { start: "2026-09-20", end: "2026-09-22" },
      ],
    },
    photos: [PHOTOS.tractorField, PHOTOS.tractorDriving, PHOTOS.tractorPlow],
    description:
      "Well-maintained Mahindra tractor, perfect for wheat and rice cultivation. Recently serviced with new tires. Available for daily or hourly rental.",
    specifications: {
      power: "47 HP",
      engine: "4-cylinder",
      fuel_capacity: "60L",
      lifting_capacity: "1700 kg",
      tires: "New rear tires",
      service: "Recently serviced",
    },
    owner: {
      id: 1,
      name: "Rajesh Kumar",
      trust_score: 85,
      phone_verified: true,
      phone: "+91 98765 43210",
      response_time_hours: 2,
      total_listings: 8,
      successful_rentals: 25,
    },
    reviews: {
      average_rating: 4.5,
      total_reviews: 18,
      recent_reviews: [
        { id: 1, reviewer_name: "Amit Singh", overall_rating: 5, title: "Excellent tractor", comment: "Well maintained, worked perfectly for my wheat field.", created_at: "2026-08-10T10:00:00Z" },
        { id: 2, reviewer_name: "Gurpreet Kaur", overall_rating: 4, title: "Good condition", comment: "Tractor was in good shape, owner was cooperative.", created_at: "2026-08-05T14:30:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 45,
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: 2,
    equipment_name: "Power Sprayer 100L",
    equipment_type: "sprayer",
    brand: "Honda",
    model: "GX160 Boom",
    year_manufactured: 2022,
    condition: "excellent",
    rental_price_per_day: 400,
    rental_price_per_hour: 60,
    security_deposit: 1000,
    distance_km: 12.3,
    location: {
      state: "Punjab",
      district: "Ludhiana",
      village: "Khanna",
      latitude: 30.7046,
      longitude: 76.2223,
      description: "Behind grain market",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2026-11-15",
      booked_dates: [{ start: "2026-09-15", end: "2026-09-16" }],
    },
    photos: [PHOTOS.boomSprayer, PHOTOS.handSprayer],
    description:
      "Honda-powered 100L boom sprayer, great for pesticide and fertilizer spraying over large fields. Comes with a spare nozzle set.",
    specifications: {
      tank_capacity: "100 L",
      engine: "Honda GX160, 4-stroke",
      boom_width: "8 ft",
      nozzle_type: "Fan + cone (spare set included)",
      service: "Serviced last month",
    },
    owner: {
      id: 2,
      name: "Harpreet Singh",
      trust_score: 78,
      phone_verified: true,
      phone: "+91 98765 11223",
      response_time_hours: 3,
      total_listings: 4,
      successful_rentals: 14,
    },
    reviews: {
      average_rating: 4.2,
      total_reviews: 9,
      recent_reviews: [
        { id: 3, reviewer_name: "Simran Kaur", overall_rating: 4, title: "Worked well", comment: "Covered my 3-acre field in one afternoon.", created_at: "2026-08-12T09:00:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 32,
    created_at: "2026-07-20T10:00:00Z",
  },
  {
    id: 3,
    equipment_name: "Wheat Harvester",
    equipment_type: "harvester",
    brand: "Kubota",
    model: "DC-70",
    year_manufactured: 2019,
    condition: "good",
    rental_price_per_day: 1500,
    rental_price_per_hour: 200,
    security_deposit: 4000,
    distance_km: 15.7,
    location: {
      state: "Punjab",
      district: "Ludhiana",
      village: "Jagraon",
      latitude: 30.7898,
      longitude: 75.4719,
      description: "Near cotton mill road",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-15",
      available_until: "2026-10-31",
      booked_dates: [{ start: "2026-09-25", end: "2026-09-28" }],
    },
    photos: [PHOTOS.combineHarvester, PHOTOS.tractorField],
    description:
      "Self-propelled combine harvester ideal for wheat and paddy. Experienced operator can be arranged on request for an extra charge.",
    specifications: {
      cutting_width: "14 ft",
      power: "70 HP",
      grain_tank: "1500 kg",
      operator_available: "Yes, on request",
    },
    owner: {
      id: 3,
      name: "Baldev Singh",
      trust_score: 90,
      phone_verified: true,
      phone: "+91 98765 33445",
      response_time_hours: 1,
      total_listings: 3,
      successful_rentals: 21,
    },
    reviews: {
      average_rating: 4.7,
      total_reviews: 15,
      recent_reviews: [
        { id: 4, reviewer_name: "Manpreet Singh", overall_rating: 5, title: "Fast and efficient", comment: "Finished 5 acres of wheat in half a day.", created_at: "2026-08-02T08:00:00Z" },
      ],
    },
    verification_status: "pending",
    view_count: 28,
    created_at: "2026-07-25T10:00:00Z",
  },
  {
    id: 4,
    equipment_name: "John Deere Tractor",
    equipment_type: "tractor",
    brand: "John Deere",
    model: "5310",
    year_manufactured: 2021,
    condition: "excellent",
    rental_price_per_day: 1200,
    rental_price_per_hour: 180,
    security_deposit: 3000,
    distance_km: 22.1,
    location: {
      state: "Punjab",
      district: "Ludhiana",
      village: "Machhiwara",
      latitude: 30.8845,
      longitude: 76.2308,
      description: "Opposite petrol pump, GT road",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2027-01-15",
      booked_dates: [],
    },
    photos: [PHOTOS.tractorDriving, PHOTOS.tractorField, PHOTOS.tractorPlow],
    description:
      "High-power John Deere tractor, well suited for heavy tillage and haulage work. Comes with a trailer hitch.",
    specifications: {
      power: "55 HP",
      engine: "3-cylinder turbo",
      lifting_capacity: "2000 kg",
      trailer_hitch: "Included",
    },
    owner: {
      id: 4,
      name: "Ranjit Sidhu",
      trust_score: 88,
      phone_verified: true,
      phone: "+91 98765 55667",
      response_time_hours: 2,
      total_listings: 6,
      successful_rentals: 30,
    },
    reviews: {
      average_rating: 4.6,
      total_reviews: 22,
      recent_reviews: [
        { id: 5, reviewer_name: "Jaspreet Kaur", overall_rating: 5, title: "Powerful tractor", comment: "Handled deep tillage on hard soil without issue.", created_at: "2026-08-14T11:00:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 67,
    created_at: "2026-06-15T10:00:00Z",
  },
  {
    id: 5,
    equipment_name: "Manual Sprayer 20L",
    equipment_type: "sprayer",
    brand: "Swaraj",
    model: "Knapsack 20",
    year_manufactured: 2023,
    condition: "good",
    rental_price_per_day: 150,
    rental_price_per_hour: 25,
    security_deposit: 300,
    distance_km: 5.8,
    location: {
      state: "Punjab",
      district: "Ludhiana",
      village: "Doraha",
      latitude: 30.933,
      longitude: 75.8527,
      description: "Near village temple, main road",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2026-10-20",
      booked_dates: [],
    },
    photos: [PHOTOS.handSprayer, PHOTOS.boomSprayer],
    description:
      "Lightweight 20L knapsack sprayer, easy to carry, great for small plots and kitchen gardens. Comes with two nozzle heads.",
    specifications: {
      tank_capacity: "20 L",
      weight: "4.2 kg (empty)",
      pump_type: "Manual lever pump",
      nozzles: "Fine mist + jet",
    },
    owner: {
      id: 5,
      name: "Sukhwinder Kaur",
      trust_score: 72,
      phone_verified: true,
      phone: "+91 98765 77889",
      response_time_hours: 4,
      total_listings: 2,
      successful_rentals: 9,
    },
    reviews: {
      average_rating: 4.0,
      total_reviews: 6,
      recent_reviews: [
        { id: 6, reviewer_name: "Ravi Verma", overall_rating: 4, title: "Handy and light", comment: "Good for my half-acre vegetable patch.", created_at: "2026-08-08T09:30:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 23,
    created_at: "2026-07-18T10:00:00Z",
  },
  {
    id: 6,
    equipment_name: "Eicher Tractor 380",
    equipment_type: "tractor",
    brand: "Eicher",
    model: "380",
    year_manufactured: 2018,
    condition: "good",
    rental_price_per_day: 600,
    rental_price_per_hour: 90,
    security_deposit: 1500,
    distance_km: 18.4,
    location: {
      state: "Haryana",
      district: "Karnal",
      village: "Assandh",
      latitude: 29.5478,
      longitude: 76.8578,
      description: "Near cattle market",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2027-02-15",
      booked_dates: [{ start: "2026-09-18", end: "2026-09-19" }],
    },
    photos: [PHOTOS.tractorField, PHOTOS.tractorPlow],
    description:
      "Reliable Eicher tractor for everyday farm work: tilling, ploughing, and hauling. Owner can arrange delivery within 5 km.",
    specifications: {
      power: "40 HP",
      engine: "3-cylinder",
      fuel_capacity: "45L",
      delivery: "Available within 5 km",
    },
    owner: {
      id: 6,
      name: "Devinder Sharma",
      trust_score: 80,
      phone_verified: true,
      phone: "+91 98765 99001",
      response_time_hours: 3,
      total_listings: 5,
      successful_rentals: 17,
    },
    reviews: {
      average_rating: 4.3,
      total_reviews: 12,
      recent_reviews: [
        { id: 7, reviewer_name: "Naresh Kumar", overall_rating: 4, title: "Good value", comment: "Affordable and got the job done.", created_at: "2026-07-30T10:00:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 31,
    created_at: "2026-06-28T10:00:00Z",
  },
  {
    id: 7,
    equipment_name: "Rice Transplanter",
    equipment_type: "harvester",
    brand: "Yanmar",
    model: "AP4",
    year_manufactured: 2021,
    condition: "excellent",
    rental_price_per_day: 1800,
    rental_price_per_hour: 250,
    security_deposit: 5000,
    distance_km: 35.2,
    location: {
      state: "Punjab",
      district: "Amritsar",
      village: "Tarn Taran",
      latitude: 31.4515,
      longitude: 74.9256,
      description: "Near gurdwara road",
    },
    availability: {
      is_available: true,
      available_from: "2026-10-01",
      available_until: "2026-11-30",
      booked_dates: [],
    },
    photos: [PHOTOS.combineHarvester],
    description:
      "Riding-type rice transplanter that plants 6 rows in a single pass, cutting transplanting time drastically compared to manual labour.",
    specifications: {
      rows: "6-row",
      power: "Yanmar diesel engine",
      seedling_tray_capacity: "6 trays",
      terrain: "Puddled paddy fields",
    },
    owner: {
      id: 7,
      name: "Gurmeet Sandhu",
      trust_score: 82,
      phone_verified: true,
      phone: "+91 98765 22110",
      response_time_hours: 5,
      total_listings: 2,
      successful_rentals: 8,
    },
    reviews: {
      average_rating: 4.4,
      total_reviews: 7,
      recent_reviews: [
        { id: 8, reviewer_name: "Kuldeep Singh", overall_rating: 5, title: "Saved us days of labour", comment: "Transplanted 4 acres in one day.", created_at: "2026-07-12T10:00:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 19,
    created_at: "2026-06-10T10:00:00Z",
  },
  {
    id: 8,
    equipment_name: "Water Pump 5HP",
    equipment_type: "pump",
    brand: "Kirloskar",
    model: "KDS 5HP",
    year_manufactured: 2020,
    condition: "good",
    rental_price_per_day: 200,
    rental_price_per_hour: 30,
    security_deposit: 500,
    distance_km: 7.9,
    location: {
      state: "Punjab",
      district: "Ludhiana",
      village: "Samrala",
      latitude: 30.8362,
      longitude: 76.19,
      description: "Near canal head",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2027-03-31",
      booked_dates: [{ start: "2026-09-08", end: "2026-09-09" }],
    },
    photos: [PHOTOS.irrigationPump],
    description:
      "5HP diesel water pump for field irrigation. Reliable for lifting water from canals and borewells, comes with 20ft suction pipe.",
    specifications: {
      power: "5 HP",
      fuel: "Diesel",
      suction_pipe: "20 ft included",
      discharge: "3 inch outlet",
    },
    owner: {
      id: 8,
      name: "Amarjit Singh",
      trust_score: 76,
      phone_verified: true,
      phone: "+91 98765 44556",
      response_time_hours: 2,
      total_listings: 3,
      successful_rentals: 19,
    },
    reviews: {
      average_rating: 4.1,
      total_reviews: 11,
      recent_reviews: [
        { id: 9, reviewer_name: "Balwinder Kaur", overall_rating: 4, title: "Reliable pump", comment: "Kept my field flooded for the whole rotation.", created_at: "2026-08-01T10:00:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 56,
    created_at: "2026-05-20T10:00:00Z",
  },
  {
    id: 9,
    equipment_name: "Rotavator 6ft",
    equipment_type: "plow",
    brand: "Fieldking",
    model: "FKR-6",
    year_manufactured: 2022,
    condition: "excellent",
    rental_price_per_day: 350,
    rental_price_per_hour: 50,
    security_deposit: 800,
    distance_km: 14.6,
    location: {
      state: "Punjab",
      district: "Jalandhar",
      village: "Nakodar",
      latitude: 31.1246,
      longitude: 75.4749,
      description: "Near cotton warehouse",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2027-06-30",
      booked_dates: [],
    },
    photos: [PHOTOS.tractorPlow, PHOTOS.tractorField],
    description:
      "6ft rotavator implement, mounts on any 40+ HP tractor. Great for fine tilth preparation before sowing.",
    specifications: {
      working_width: "6 ft",
      blades: "42 L-type blades",
      required_hp: "40 HP or above",
      attachment: "3-point linkage",
    },
    owner: {
      id: 9,
      name: "Iqbal Deep",
      trust_score: 84,
      phone_verified: true,
      phone: "+91 98765 66778",
      response_time_hours: 3,
      total_listings: 4,
      successful_rentals: 22,
    },
    reviews: {
      average_rating: 4.6,
      total_reviews: 16,
      recent_reviews: [
        { id: 10, reviewer_name: "Harjit Singh", overall_rating: 5, title: "Sharp blades", comment: "Left a perfect fine tilth for sowing.", created_at: "2026-07-22T10:00:00Z" },
      ],
    },
    verification_status: "verified",
    view_count: 41,
    created_at: "2026-06-05T10:00:00Z",
  },
  {
    id: 10,
    equipment_name: "Swaraj Tractor 855",
    equipment_type: "tractor",
    brand: "Swaraj",
    model: "855 FE",
    year_manufactured: 2019,
    condition: "good",
    rental_price_per_day: 750,
    rental_price_per_hour: 110,
    security_deposit: 1800,
    distance_km: 28.3,
    location: {
      state: "Haryana",
      district: "Panipat",
      village: "Israna",
      latitude: 29.3273,
      longitude: 76.9847,
      description: "Near grain mandi gate 2",
    },
    availability: {
      is_available: true,
      available_from: "2026-09-01",
      available_until: "2027-04-30",
      booked_dates: [{ start: "2026-09-14", end: "2026-09-17" }],
    },
    photos: [PHOTOS.tractorDriving, PHOTOS.tractorField],
    description:
      "Sturdy Swaraj 855 tractor, a farmer favourite for heavy-duty ploughing and haulage. Recently repainted and serviced.",
    specifications: {
      power: "50 HP",
      engine: "3-cylinder",
      lifting_capacity: "1800 kg",
      service: "Repainted and serviced this season",
    },
    owner: {
      id: 10,
      name: "Satnam Chahal",
      trust_score: 79,
      phone_verified: false,
      phone: null,
      response_time_hours: 6,
      total_listings: 2,
      successful_rentals: 6,
    },
    reviews: {
      average_rating: 3.9,
      total_reviews: 5,
      recent_reviews: [
        { id: 11, reviewer_name: "Vikram Rathi", overall_rating: 4, title: "Solid tractor", comment: "Bit slow to respond but tractor worked well.", created_at: "2026-07-05T10:00:00Z" },
      ],
    },
    verification_status: "pending",
    view_count: 22,
    created_at: "2026-05-30T10:00:00Z",
  },
];

export function getEquipmentById(id: number | string): SampleEquipment | undefined {
  const numId = typeof id === "string" ? Number(id) : id;
  return SAMPLE_EQUIPMENT.find((item) => item.id === numId);
}

export const EQUIPMENT_CATEGORY_SUMMARY = [
  { name: "tractor", icon: "🚜", count: 4, min_price: 600, max_price: 1200 },
  { name: "sprayer", icon: "🧴", count: 2, min_price: 150, max_price: 400 },
  { name: "harvester", icon: "🌾", count: 2, min_price: 1500, max_price: 1800 },
  { name: "pump", icon: "💧", count: 1, min_price: 200, max_price: 200 },
  { name: "plow", icon: "🔨", count: 1, min_price: 350, max_price: 350 },
];
