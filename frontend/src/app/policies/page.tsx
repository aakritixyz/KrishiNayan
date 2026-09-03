"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage, type Language } from "@/lib/language-context";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronDown,
  ExternalLink,
  FileCheck2,
  Landmark,
  Loader2,
  Pencil,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

type Scheme = {
  id: string;
  name: string;
  category: string;
  administering_body: string;
  short_description: string;
  benefits: string;
  required_documents: string[];
  official_link: string;
  application_mode: string;
  helpline?: string;
  source_urls: string[];
  last_verified: string;
};

type EligibilityResult = {
  scheme: Scheme;
  eligible: boolean;
  relevance_score: number;
  match_reasons: string[];
};

type FarmerProfileForm = {
  state: string;
  land_holding_acres: number;
  crop: string;
  category: string;
  has_bank_account: boolean;
  has_aadhaar: boolean;
};

const TEXT = {
  en: {
    title: "Government Schemes",
    descriptionSaved: "Ranked using your saved farm profile.",
    descriptionDefault:
      "Schemes ranked for your profile, with eligibility, benefits, documents and the official link to apply.",
    checking: "Checking eligibility...",
    likelyQualify: (n: number) => `${n} schemes you likely qualify for`,
    acres: "acres",
    login: "Log in",
    loginHint:
      "to rank schemes from your saved farm profile instead of filling this in each time.",
    yourProfile: "Your profile",
    profileHint: "Used only to rank schemes on this screen.",
    state: "State",
    landHolding: "Land holding (acres)",
    crop: "Crop",
    farmerCategory: "Farmer category",
    marginal: "Marginal",
    small: "Small",
    general: "General",
    bank: "Have bank account",
    aadhaar: "Have Aadhaar",
    update: "Update schemes",
    backendFailed: "Backend connection failed.",
    backendHint: "Make sure the KrishiNayan backend is running.",
    loading: "Loading schemes...",
    match: "match",
    notEligible: "Likely not eligible",
    benefits: "Benefits",
    docsApply: "Documents & how to apply",
    helpline: "Helpline",
    sourceVerified: "Source verified",
    apply: "Apply on official site",
    editFarm: "Edit farm profile",
    guestReadonly: "Guest mode is read-only",
    editFilters: "Edit filter profile",
    goBack: "Go back",
  },
  hi: {
    title: "सरकारी योजनाएँ",
    descriptionSaved: "आपकी सहेजी गई खेत प्रोफ़ाइल के आधार पर रैंक किया गया।",
    descriptionDefault:
      "आपकी प्रोफ़ाइल के अनुसार योजनाएँ रैंक की गई हैं, जिनमें पात्रता, लाभ, दस्तावेज़ और आवेदन का आधिकारिक लिंक शामिल है।",
    checking: "पात्रता जाँची जा रही है...",
    likelyQualify: (n: number) => `आप संभवतः ${n} योजनाओं के लिए पात्र हैं`,
    acres: "एकड़",
    login: "लॉग इन",
    loginHint:
      "करें ताकि हर बार जानकारी भरने के बजाय आपकी सहेजी गई खेत प्रोफ़ाइल से योजनाएँ रैंक की जा सकें।",
    yourProfile: "आपकी प्रोफ़ाइल",
    profileHint: "इस स्क्रीन पर योजनाओं को रैंक करने के लिए ही उपयोग किया जाता है।",
    state: "राज्य",
    landHolding: "भूमि जोत (एकड़)",
    crop: "फसल",
    farmerCategory: "किसान श्रेणी",
    marginal: "सीमांत",
    small: "लघु",
    general: "सामान्य",
    bank: "बैंक खाता है",
    aadhaar: "आधार है",
    update: "योजनाएँ अपडेट करें",
    backendFailed: "बैकएंड कनेक्शन विफल रहा।",
    backendHint: "सुनिश्चित करें कि KrishiNayan बैकएंड चल रहा है।",
    loading: "योजनाएँ लोड हो रही हैं...",
    match: "मेल",
    notEligible: "संभवतः पात्र नहीं",
    benefits: "लाभ",
    docsApply: "दस्तावेज़ और आवेदन प्रक्रिया",
    helpline: "हेल्पलाइन",
    sourceVerified: "स्रोत सत्यापित",
    apply: "आधिकारिक साइट पर आवेदन करें",
    editFarm: "खेत प्रोफ़ाइल संपादित करें",
    guestReadonly: "अतिथि मोड केवल पढ़ने के लिए है",
    editFilters: "फ़िल्टर प्रोफ़ाइल संपादित करें",
    goBack: "वापस जाएँ",
  },
  pa: {
    title: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ",
    descriptionSaved: "ਤੁਹਾਡੀ ਸੇਵ ਕੀਤੀ ਖੇਤ ਪ੍ਰੋਫ਼ਾਈਲ ਅਨੁਸਾਰ ਦਰਜਾਬੰਦੀ ਕੀਤੀ ਗਈ ਹੈ।",
    descriptionDefault:
      "ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ ਅਨੁਸਾਰ ਯੋਜਨਾਵਾਂ ਦਰਜਾਬੰਦੀ ਕੀਤੀਆਂ ਗਈਆਂ ਹਨ, ਜਿਸ ਵਿੱਚ ਯੋਗਤਾ, ਲਾਭ, ਦਸਤਾਵੇਜ਼ ਅਤੇ ਅਰਜ਼ੀ ਲਈ ਅਧਿਕਾਰਤ ਲਿੰਕ ਸ਼ਾਮਲ ਹਨ।",
    checking: "ਯੋਗਤਾ ਜਾਂਚੀ ਜਾ ਰਹੀ ਹੈ...",
    likelyQualify: (n: number) => `ਤੁਸੀਂ ਸੰਭਵਤ: ${n} ਯੋਜਨਾਵਾਂ ਲਈ ਯੋਗ ਹੋ`,
    acres: "ਏਕੜ",
    login: "ਲੌਗ ਇਨ",
    loginHint:
      "ਕਰੋ ਤਾਂ ਜੋ ਹਰ ਵਾਰ ਜਾਣਕਾਰੀ ਭਰਨ ਦੀ ਥਾਂ ਤੁਹਾਡੀ ਸੇਵ ਕੀਤੀ ਖੇਤ ਪ੍ਰੋਫ਼ਾਈਲ ਅਨੁਸਾਰ ਯੋਜਨਾਵਾਂ ਦਰਜਾਬੰਦੀ ਹੋਣ।",
    yourProfile: "ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ",
    profileHint: "ਇਸ ਸਕ੍ਰੀਨ ਉੱਤੇ ਯੋਜਨਾਵਾਂ ਦੀ ਦਰਜਾਬੰਦੀ ਲਈ ਹੀ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ।",
    state: "ਰਾਜ",
    landHolding: "ਜ਼ਮੀਨ ਦੀ ਮਲਕੀਅਤ (ਏਕੜ)",
    crop: "ਫਸਲ",
    farmerCategory: "ਕਿਸਾਨ ਸ਼੍ਰੇਣੀ",
    marginal: "ਸੀਮਾਂਤ",
    small: "ਛੋਟਾ",
    general: "ਆਮ",
    bank: "ਬੈਂਕ ਖਾਤਾ ਹੈ",
    aadhaar: "ਆਧਾਰ ਹੈ",
    update: "ਯੋਜਨਾਵਾਂ ਅੱਪਡੇਟ ਕਰੋ",
    backendFailed: "ਬੈਕਐਂਡ ਕਨੈਕਸ਼ਨ ਫੇਲ੍ਹ ਹੋਇਆ।",
    backendHint: "ਯਕੀਨੀ ਬਣਾਓ ਕਿ KrishiNayan ਬੈਕਐਂਡ ਚੱਲ ਰਿਹਾ ਹੈ।",
    loading: "ਯੋਜਨਾਵਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
    match: "ਮੈਚ",
    notEligible: "ਸੰਭਵਤ: ਯੋਗ ਨਹੀਂ",
    benefits: "ਲਾਭ",
    docsApply: "ਦਸਤਾਵੇਜ਼ ਅਤੇ ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ",
    helpline: "ਹੈਲਪਲਾਈਨ",
    sourceVerified: "ਸਰੋਤ ਤਸਦੀਕ ਕੀਤਾ",
    apply: "ਅਧਿਕਾਰਤ ਸਾਈਟ ਉੱਤੇ ਅਰਜ਼ੀ ਦਿਓ",
    editFarm: "ਖੇਤ ਪ੍ਰੋਫ਼ਾਈਲ ਸੋਧੋ",
    guestReadonly: "ਮਹਿਮਾਨ ਮੋਡ ਸਿਰਫ਼ ਪੜ੍ਹਨ ਲਈ ਹੈ",
    editFilters: "ਫਿਲਟਰ ਪ੍ਰੋਫ਼ਾਈਲ ਸੋਧੋ",
    goBack: "ਵਾਪਸ ਜਾਓ",
  },
  mr: {
    title: "सरकारी योजना",
    descriptionSaved: "तुमच्या जतन केलेल्या शेत प्रोफाइलनुसार क्रमवारी लावली आहे.",
    descriptionDefault:
      "तुमच्या प्रोफाइलनुसार योजनांची क्रमवारी लावली आहे; त्यात पात्रता, लाभ, कागदपत्रे आणि अर्जासाठी अधिकृत दुवा दिला आहे.",
    checking: "पात्रता तपासत आहे...",
    likelyQualify: (n: number) => `तुम्ही बहुधा ${n} योजनांसाठी पात्र आहात`,
    acres: "एकर",
    login: "लॉग इन",
    loginHint:
      "करा, जेणेकरून प्रत्येक वेळी माहिती भरण्याऐवजी जतन केलेल्या शेत प्रोफाइलनुसार योजना क्रमवारीत दिसतील.",
    yourProfile: "तुमची प्रोफाइल",
    profileHint: "या स्क्रीनवर योजनांची क्रमवारी लावण्यासाठीच वापरले जाते.",
    state: "राज्य",
    landHolding: "जमीन धारणा (एकर)",
    crop: "पीक",
    farmerCategory: "शेतकरी श्रेणी",
    marginal: "अल्पभूधारक",
    small: "लहान",
    general: "सामान्य",
    bank: "बँक खाते आहे",
    aadhaar: "आधार आहे",
    update: "योजना अद्ययावत करा",
    backendFailed: "बॅकएंड कनेक्शन अयशस्वी.",
    backendHint: "KrishiNayan बॅकएंड चालू असल्याची खात्री करा.",
    loading: "योजना लोड होत आहेत...",
    match: "जुळणी",
    notEligible: "बहुधा पात्र नाही",
    benefits: "लाभ",
    docsApply: "कागदपत्रे आणि अर्ज प्रक्रिया",
    helpline: "हेल्पलाइन",
    sourceVerified: "स्रोत पडताळले",
    apply: "अधिकृत साइटवर अर्ज करा",
    editFarm: "शेत प्रोफाइल संपादित करा",
    guestReadonly: "अतिथी मोड फक्त वाचनासाठी आहे",
    editFilters: "फिल्टर प्रोफाइल संपादित करा",
    goBack: "मागे जा",
  },
} satisfies Record<Language, Record<string, unknown>>;

const GUEST_POLICY_RESULTS: EligibilityResult[] = [
  {
    scheme: {
      id: "pm-kisan-sample",
      name: "PM-KISAN",
      category: "Income Support",
      administering_body: "Government of India",
      short_description:
        "Sample scheme card shown in Guest mode for UI exploration.",
      benefits:
        "Illustrative income-support information. Sign in for personalised eligibility.",
      required_documents: ["Aadhaar", "Bank account", "Land record"],
      official_link: "https://pmkisan.gov.in/",
      application_mode:
        "Use the official portal or authorised local channel.",
      source_urls: ["https://pmkisan.gov.in/"],
      last_verified: "Guest sample",
    },
    eligible: true,
    relevance_score: 86,
    match_reasons: [
      "Sample match for Maharashtra",
      "Sample small-farmer profile",
    ],
  },
  {
    scheme: {
      id: "pmfby-sample",
      name: "PMFBY",
      category: "Crop Insurance",
      administering_body: "Government of India",
      short_description:
        "Sample crop-insurance scheme information for Guest mode.",
      benefits:
        "Illustrative insurance support for notified crops and risks.",
      required_documents: ["Aadhaar", "Bank account", "Crop/land details"],
      official_link: "https://pmfby.gov.in/",
      application_mode:
        "Apply through the official portal or participating channels.",
      source_urls: ["https://pmfby.gov.in/"],
      last_verified: "Guest sample",
    },
    eligible: true,
    relevance_score: 78,
    match_reasons: [
      "Sample tomato farmer profile",
      "Sample Maharashtra location",
    ],
  },
];

const DEFAULT_PROFILE: FarmerProfileForm = {
  state: "Maharashtra",
  land_holding_acres: 2,
  crop: "Tomato",
  category: "small",
  has_bank_account: true,
  has_aadhaar: true,
};


const STATE_OPTIONS = [
  "Maharashtra",
  "Bihar",
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Telangana",
];

const CROP_OPTIONS = [
  "Tomato",
  "Maize",
  "Rice",
];

function localizeValue(value: string, language: Language): string {
  if (!value || language === "en") return value;

  const dictionary: Record<string, Record<Exclude<Language, "en">, string>> = {
    Maharashtra: { hi: "महाराष्ट्र", pa: "ਮਹਾਰਾਸ਼ਟਰ", mr: "महाराष्ट्र" },
    Bihar: { hi: "बिहार", pa: "ਬਿਹਾਰ", mr: "बिहार" },
    Punjab: { hi: "पंजाब", pa: "ਪੰਜਾਬ", mr: "पंजाब" },
    Haryana: { hi: "हरियाणा", pa: "ਹਰਿਆਣਾ", mr: "हरियाणा" },
    "Uttar Pradesh": { hi: "उत्तर प्रदेश", pa: "ਉੱਤਰ ਪ੍ਰਦੇਸ਼", mr: "उत्तर प्रदेश" },
    Telangana: { hi: "तेलंगाना", pa: "ਤੇਲੰਗਾਨਾ", mr: "तेलंगणा" },

    Tomato: { hi: "टमाटर", pa: "ਟਮਾਟਰ", mr: "टोमॅटो" },
    Maize: { hi: "मक्का", pa: "ਮੱਕੀ", mr: "मका" },
    Rice: { hi: "धान", pa: "ਧਾਨ", mr: "भात" },

    "Income Support": { hi: "आय सहायता", pa: "ਆਮਦਨ ਸਹਾਇਤਾ", mr: "उत्पन्न सहाय्य" },
    "Crop Insurance": { hi: "फसल बीमा", pa: "ਫਸਲ ਬੀਮਾ", mr: "पीक विमा" },
    "Credit Support": { hi: "ऋण सहायता", pa: "ਕਰਜ਼ ਸਹਾਇਤਾ", mr: "कर्ज सहाय्य" },
    "Irrigation Support": { hi: "सिंचाई सहायता", pa: "ਸਿੰਚਾਈ ਸਹਾਇਤਾ", mr: "सिंचन सहाय्य" },
    "Soil Health": { hi: "मृदा स्वास्थ्य", pa: "ਮਿੱਟੀ ਸਿਹਤ", mr: "माती आरोग्य" },
    "Farm Equipment": { hi: "कृषि उपकरण", pa: "ਖੇਤੀ ਉਪਕਰਣ", mr: "शेती उपकरणे" },
    "Subsidy": { hi: "सब्सिडी", pa: "ਸਬਸਿਡੀ", mr: "अनुदान" },

    "Government of India": { hi: "भारत सरकार", pa: "ਭਾਰਤ ਸਰਕਾਰ", mr: "भारत सरकार" },
    "Ministry of Agriculture & Farmers Welfare": {
      hi: "कृषि एवं किसान कल्याण मंत्रालय",
      pa: "ਖੇਤੀਬਾੜੀ ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ ਮੰਤਰਾਲਾ",
      mr: "कृषी आणि शेतकरी कल्याण मंत्रालय",
    },
    "Ministry of Agriculture and Farmers Welfare": {
      hi: "कृषि एवं किसान कल्याण मंत्रालय",
      pa: "ਖੇਤੀਬਾੜੀ ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ ਮੰਤਰਾਲਾ",
      mr: "कृषी आणि शेतकरी कल्याण मंत्रालय",
    },
    "State Government": {
      hi: "राज्य सरकार",
      pa: "ਰਾਜ ਸਰਕਾਰ",
      mr: "राज्य सरकार",
    },

    Aadhaar: { hi: "आधार", pa: "ਆਧਾਰ", mr: "आधार" },
    "Aadhaar card": { hi: "आधार कार्ड", pa: "ਆਧਾਰ ਕਾਰਡ", mr: "आधार कार्ड" },
    "Bank account": { hi: "बैंक खाता", pa: "ਬੈਂਕ ਖਾਤਾ", mr: "बँक खाते" },
    "Bank passbook": { hi: "बैंक पासबुक", pa: "ਬੈਂਕ ਪਾਸਬੁੱਕ", mr: "बँक पासबुक" },
    "Land record": { hi: "भूमि रिकॉर्ड", pa: "ਜ਼ਮੀਨ ਰਿਕਾਰਡ", mr: "जमीन नोंद" },
    "Land records": { hi: "भूमि रिकॉर्ड", pa: "ਜ਼ਮੀਨ ਰਿਕਾਰਡ", mr: "जमीन नोंदी" },
    "Crop/land details": { hi: "फसल/भूमि विवरण", pa: "ਫਸਲ/ਜ਼ਮੀਨ ਵੇਰਵੇ", mr: "पीक/जमीन तपशील" },
    "Mobile number": { hi: "मोबाइल नंबर", pa: "ਮੋਬਾਈਲ ਨੰਬਰ", mr: "मोबाईल क्रमांक" },
    "Farmer ID": { hi: "किसान आईडी", pa: "ਕਿਸਾਨ ਆਈਡੀ", mr: "शेतकरी आयडी" },

    "Guest sample": { hi: "अतिथि नमूना", pa: "ਮਹਿਮਾਨ ਨਮੂਨਾ", mr: "अतिथी नमुना" },

    "Sample scheme card shown in Guest mode for UI exploration.": {
      hi: "यूआई देखने के लिए अतिथि मोड में दिखाई गई नमूना योजना।",
      pa: "ਯੂਆਈ ਵੇਖਣ ਲਈ ਮਹਿਮਾਨ ਮੋਡ ਵਿੱਚ ਦਿਖਾਈ ਗਈ ਨਮੂਨਾ ਯੋਜਨਾ।",
      mr: "यूआय पाहण्यासाठी अतिथी मोडमध्ये दाखवलेली नमुना योजना.",
    },
    "Illustrative income-support information. Sign in for personalised eligibility.": {
      hi: "यह आय सहायता की नमूना जानकारी है। व्यक्तिगत पात्रता के लिए लॉग इन करें।",
      pa: "ਇਹ ਆਮਦਨ ਸਹਾਇਤਾ ਦੀ ਨਮੂਨਾ ਜਾਣਕਾਰੀ ਹੈ। ਨਿੱਜੀ ਯੋਗਤਾ ਲਈ ਲੌਗ ਇਨ ਕਰੋ।",
      mr: "ही उत्पन्न सहाय्याची नमुना माहिती आहे. वैयक्तिक पात्रतेसाठी लॉग इन करा.",
    },
    "Use the official portal or authorised local channel.": {
      hi: "आधिकारिक पोर्टल या अधिकृत स्थानीय माध्यम का उपयोग करें।",
      pa: "ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਜਾਂ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਸਥਾਨਕ ਮਾਧਿਅਮ ਵਰਤੋ।",
      mr: "अधिकृत पोर्टल किंवा अधिकृत स्थानिक माध्यम वापरा.",
    },
    "Sample match for Maharashtra": {
      hi: "महाराष्ट्र के लिए नमूना मिलान",
      pa: "ਮਹਾਰਾਸ਼ਟਰ ਲਈ ਨਮੂਨਾ ਮੈਚ",
      mr: "महाराष्ट्रासाठी नमुना जुळणी",
    },
    "Sample small-farmer profile": {
      hi: "लघु किसान प्रोफ़ाइल का नमूना मिलान",
      pa: "ਛੋਟੇ ਕਿਸਾਨ ਪ੍ਰੋਫ਼ਾਈਲ ਦਾ ਨਮੂਨਾ ਮੈਚ",
      mr: "लहान शेतकरी प्रोफाइलची नमुना जुळणी",
    },
    "Sample crop-insurance scheme information for Guest mode.": {
      hi: "अतिथि मोड के लिए फसल बीमा योजना की नमूना जानकारी।",
      pa: "ਮਹਿਮਾਨ ਮੋਡ ਲਈ ਫਸਲ ਬੀਮਾ ਯੋਜਨਾ ਦੀ ਨਮੂਨਾ ਜਾਣਕਾਰੀ।",
      mr: "अतिथी मोडसाठी पीक विमा योजनेची नमुना माहिती.",
    },
    "Illustrative insurance support for notified crops and risks.": {
      hi: "अधिसूचित फसलों और जोखिमों के लिए बीमा सहायता की नमूना जानकारी।",
      pa: "ਸੂਚਿਤ ਫਸਲਾਂ ਅਤੇ ਖਤਰਿਆਂ ਲਈ ਬੀਮਾ ਸਹਾਇਤਾ ਦੀ ਨਮੂਨਾ ਜਾਣਕਾਰੀ।",
      mr: "अधिसूचित पिके आणि जोखमींसाठी विमा सहाय्याची नमुना माहिती.",
    },
    "Apply through the official portal or participating channels.": {
      hi: "आधिकारिक पोर्टल या भाग लेने वाले माध्यमों से आवेदन करें।",
      pa: "ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਜਾਂ ਭਾਗੀਦਾਰ ਮਾਧਿਅਮਾਂ ਰਾਹੀਂ ਅਰਜ਼ੀ ਦਿਓ।",
      mr: "अधिकृत पोर्टल किंवा सहभागी माध्यमांद्वारे अर्ज करा.",
    },
    "Sample tomato farmer profile": {
      hi: "टमाटर किसान प्रोफ़ाइल का नमूना मिलान",
      pa: "ਟਮਾਟਰ ਕਿਸਾਨ ਪ੍ਰੋਫ਼ਾਈਲ ਦਾ ਨਮੂਨਾ ਮੈਚ",
      mr: "टोमॅटो शेतकरी प्रोफाइलची नमुना जुळणी",
    },
    "Sample Maharashtra location": {
      hi: "महाराष्ट्र स्थान का नमूना मिलान",
      pa: "ਮਹਾਰਾਸ਼ਟਰ ਸਥਾਨ ਦਾ ਨਮੂਨਾ ਮੈਚ",
      mr: "महाराष्ट्र स्थानाची नमुना जुळणी",
    },

    "Backend connection failed.": {
      hi: "बैकएंड कनेक्शन विफल रहा।",
      pa: "ਬੈਕਐਂਡ ਕਨੈਕਸ਼ਨ ਫੇਲ੍ਹ ਹੋਇਆ।",
      mr: "बॅकएंड कनेक्शन अयशस्वी.",
    },
  };

  const translated =
    dictionary[value]?.[language as Exclude<Language, "en">];

  if (translated) return translated;

  // Dynamic eligibility reasons returned by the backend.
  const coversCrop = value.match(/^Covers (.+)\.$/i);
  if (coversCrop) {
    const crop = localizeValue(coversCrop[1], language);
    return language === "hi"
      ? `${crop} फसल इस योजना में शामिल है।`
      : language === "pa"
      ? `${crop} ਫਸਲ ਇਸ ਯੋਜਨਾ ਵਿੱਚ ਸ਼ਾਮਲ ਹੈ।`
      : `${crop} पीक या योजनेत समाविष्ट आहे.`;
  }

  const stateMatch = value.match(/^(?:Available in|State match:?|Matches state:?)[ ]*(.+)\.?$/i);
  if (stateMatch) {
    const state = localizeValue(stateMatch[1].replace(/\.$/, ""), language);
    return language === "hi"
      ? `${state} में उपलब्ध`
      : language === "pa"
      ? `${state} ਵਿੱਚ ਉਪਲਬਧ`
      : `${state} मध्ये उपलब्ध`;
  }

  if (/bank account/i.test(value)) {
    return language === "hi"
      ? "बैंक खाता संबंधी आवश्यकता पूरी होती है।"
      : language === "pa"
      ? "ਬੈਂਕ ਖਾਤੇ ਦੀ ਲੋੜ ਪੂਰੀ ਹੁੰਦੀ ਹੈ।"
      : "बँक खात्याची अट पूर्ण होते.";
  }

  if (/aadhaar/i.test(value)) {
    return language === "hi"
      ? "आधार संबंधी आवश्यकता पूरी होती है।"
      : language === "pa"
      ? "ਆਧਾਰ ਦੀ ਲੋੜ ਪੂਰੀ ਹੁੰਦੀ ਹੈ।"
      : "आधारची अट पूर्ण होते.";
  }

  if (/land holding|landholding|acre/i.test(value)) {
    return language === "hi"
      ? "भूमि जोत की पात्रता आपकी प्रोफ़ाइल से मेल खाती है।"
      : language === "pa"
      ? "ਜ਼ਮੀਨੀ ਹੋਲਡਿੰਗ ਦੀ ਯੋਗਤਾ ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ ਨਾਲ ਮੇਲ ਖਾਂਦੀ ਹੈ।"
      : "जमीन धारणेची पात्रता तुमच्या प्रोफाइलशी जुळते.";
  }

  return value;
}

function localizeSchemeName(name: string, language: Language): string {
  if (language === "en") return name;

  const names: Record<string, Record<Exclude<Language, "en">, string>> = {
    "PM-KISAN": {
      hi: "पीएम-किसान",
      pa: "ਪੀਐਮ-ਕਿਸਾਨ",
      mr: "पीएम-किसान",
    },
    PMFBY: {
      hi: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
      pa: "ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਫਸਲ ਬੀਮਾ ਯੋਜਨਾ (PMFBY)",
      mr: "प्रधानमंत्री पीक विमा योजना (PMFBY)",
    },
  };

  return names[name]?.[language as Exclude<Language, "en">] ?? name;
}

function localizeResult(
  result: EligibilityResult,
  language: Language
): EligibilityResult {
  return {
    ...result,
    scheme: {
      ...result.scheme,
      name: localizeSchemeName(result.scheme.name, language),
      category: localizeValue(result.scheme.category, language),
      administering_body: localizeValue(
        result.scheme.administering_body,
        language
      ),
      short_description: localizeValue(
        result.scheme.short_description,
        language
      ),
      benefits: localizeValue(result.scheme.benefits, language),
      required_documents: result.scheme.required_documents.map((item) =>
        localizeValue(item, language)
      ),
      application_mode: localizeValue(
        result.scheme.application_mode,
        language
      ),
      last_verified: localizeValue(result.scheme.last_verified, language),
    },
    match_reasons: result.match_reasons.map((reason) =>
      localizeValue(reason, language)
    ),
  };
}

export default function PoliciesPage() {
  const router = useRouter();
  const { user, isGuest, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();
  const t = TEXT[language];

  const [profile, setProfile] =
    useState<FarmerProfileForm>(DEFAULT_PROFILE);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<EligibilityResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usingSavedProfile, setUsingSavedProfile] = useState(false);

  const fetchEligibleSchemes = useCallback(
    async (currentProfile: FarmerProfileForm) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await apiJson<{ results: EligibilityResult[] }>(
          "/policies/eligible",
          {
            method: "POST",
            body: JSON.stringify({
              ...currentProfile,
              language,
            }),
          }
        );
        setResults(data.results);
        setUsingSavedProfile(false);
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError ? error.message : String(t.backendFailed)
        );
      } finally {
        setIsLoading(false);
      }
    },
    [t.backendFailed, language]
  );

  const fetchEligibleSchemesForMe = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiJson<{
        results: EligibilityResult[];
        profile_used: Partial<FarmerProfileForm>;
      }>(`/policies/eligible/me?language=${language}`);

      setResults(data.results);
      setProfile((current) => ({ ...current, ...data.profile_used }));
      setUsingSavedProfile(true);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : String(t.backendFailed)
      );
    } finally {
      setIsLoading(false);
    }
  }, [t.backendFailed, language]);

  useEffect(() => {
    if (isAuthLoading) return;

    const timer = window.setTimeout(() => {
      if (isGuest) {
        setResults(GUEST_POLICY_RESULTS);
        setUsingSavedProfile(false);
        setIsLoading(false);
      } else if (user) {
        fetchEligibleSchemesForMe();
      } else {
        fetchEligibleSchemes(DEFAULT_PROFILE);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    isAuthLoading,
    user,
    isGuest,
    fetchEligibleSchemesForMe,
    fetchEligibleSchemes,
  ]);

  const eligibleCount =
    results?.filter((result) => result.eligible).length ?? 0;

  const displayResults = useMemo(
    () => results?.map((result) => localizeResult(result, language)) ?? null,
    [results, language]
  );

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame app-frame--wide bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label={String(t.goBack)}
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-bold text-forest">
            {String(t.title)}
          </h1>

          <button
            type="button"
            onClick={() =>
              user
                ? router.push("/profile")
                : isGuest
                ? undefined
                : setShowFilters((value) => !value)
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label={
              user
                ? String(t.editFarm)
                : isGuest
                ? String(t.guestReadonly)
                : String(t.editFilters)
            }
          >
            {user ? <Pencil size={18} /> : <SlidersHorizontal size={19} />}
          </button>
        </header>

        <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-muted lg:text-center">
          {usingSavedProfile
            ? String(t.descriptionSaved)
            : String(t.descriptionDefault)}
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <PolicyMetric
            icon={<Landmark size={21} />}
            label="Likely eligible"
            value={isLoading ? "..." : eligibleCount}
            tone="dark"
          />
          <PolicyMetric
            icon={<FileCheck2 size={21} />}
            label="Documents tracked"
            value="Aadhaar + bank"
          />
          <PolicyMetric
            icon={<WalletCards size={21} />}
            label="Ranked for"
            value={localizeValue(profile.crop, language)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[22px] bg-forest p-4 text-white lg:mx-auto lg:max-w-3xl">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf text-forest-deep">
            <Landmark size={22} />
          </span>

          <div>
            <p className="font-bold">
              {isLoading
                ? String(t.checking)
                : (t.likelyQualify as (n: number) => string)(eligibleCount)}
            </p>
            <p className="mt-0.5 text-xs text-white/65">
              {localizeValue(profile.crop, language)} •{" "}
              {profile.land_holding_acres} {String(t.acres)} •{" "}
              {localizeValue(profile.state, language)}
            </p>
          </div>
        </div>

        {!user && !isGuest && !isAuthLoading && (
          <div className="mt-3 rounded-[18px] border border-forest/10 bg-white/70 p-3 text-xs leading-5 text-muted">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-bold text-forest underline"
            >
              {String(t.login)}
            </button>{" "}
            {String(t.loginHint)}
          </div>
        )}

        {showFilters && !user && !isGuest && (
          <div className="mt-4 rounded-[24px] border border-forest/10 bg-white p-4 lg:mx-auto lg:max-w-3xl">
            <p className="font-bold text-forest">{String(t.yourProfile)}</p>
            <p className="mt-1 text-xs text-muted">{String(t.profileHint)}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-muted">
                {String(t.state)}
                <select
                  value={profile.state}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      state: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                >
                  {STATE_OPTIONS.map((state) => (
                    <option key={state} value={state}>
                      {localizeValue(state, language)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-muted">
                {String(t.landHolding)}
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={profile.land_holding_acres}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      land_holding_acres: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                />
              </label>

              <label className="text-xs font-semibold text-muted">
                {String(t.crop)}
                <select
                  value={profile.crop}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      crop: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                >
                  {CROP_OPTIONS.map((crop) => (
                    <option key={crop} value={crop}>
                      {localizeValue(crop, language)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-muted">
                {String(t.farmerCategory)}
                <select
                  value={profile.category}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                >
                  <option value="marginal">{String(t.marginal)}</option>
                  <option value="small">{String(t.small)}</option>
                  <option value="general">{String(t.general)}</option>
                </select>
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-forest">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.has_bank_account}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      has_bank_account: event.target.checked,
                    }))
                  }
                />
                {String(t.bank)}
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.has_aadhaar}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      has_aadhaar: event.target.checked,
                    }))
                  }
                />
                {String(t.aadhaar)}
              </label>
            </div>

            <button
              type="button"
              onClick={() => fetchEligibleSchemes(profile)}
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {String(t.update)}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-[20px] bg-danger/10 p-4 text-sm font-semibold text-danger">
            {localizeValue(errorMessage, language)} {String(t.backendHint)}
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {isLoading && !displayResults ? (
            <div className="flex items-center justify-center gap-2 rounded-[24px] border border-forest/10 bg-white p-8 text-sm font-semibold text-muted">
              <Loader2 size={18} className="animate-spin" />
              {String(t.loading)}
            </div>
          ) : (
            displayResults?.map((result) => (
              <SchemeCard
                key={result.scheme.id}
                result={result}
                language={language}
              />
            ))
          )}
        </div>

        <BottomNav />
      </section>
    </main>
  );
}

function PolicyMetric({
  icon,
  label,
  value,
  tone = "light",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div
      className={`rounded-[24px] p-4 ${
        dark ? "bg-forest text-white" : "border border-forest/10 bg-white text-forest"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            dark ? "bg-leaf text-forest-deep" : "bg-leaf/25 text-forest"
          }`}
        >
          {icon}
        </span>
        <div>
          <p className={`text-xs font-semibold ${dark ? "text-white/55" : "text-muted"}`}>
            {label}
          </p>
          <p className="mt-1 text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SchemeCard({
  result,
  language,
}: {
  result: EligibilityResult;
  language: Language;
}) {
  const t = TEXT[language];
  const { scheme, eligible, relevance_score, match_reasons } = result;

  return (
    <div
      className={`rounded-[26px] border p-4 ${
        eligible
          ? "border-leaf/40 bg-white"
          : "border-forest/10 bg-white/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-forest/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">
            {scheme.category}
          </span>

          <h2 className="mt-2 text-lg font-bold leading-tight text-forest">
            {scheme.name}
          </h2>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Building2 size={13} />
            {scheme.administering_body}
          </p>
        </div>

        {eligible ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-leaf px-3 py-1.5 text-xs font-bold text-forest-deep">
            <BadgeCheck size={14} />
            {relevance_score}% {String(t.match)}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-forest/10 px-3 py-1.5 text-xs font-bold text-muted">
            {String(t.notEligible)}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">
        {scheme.short_description}
      </p>

      <div className="mt-3 rounded-2xl bg-forest/5 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-forest/70">
          {String(t.benefits)}
        </p>
        <p className="mt-1 text-sm leading-6 text-forest">
          {scheme.benefits}
        </p>
      </div>

      {match_reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {match_reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-xs leading-5 text-muted"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
              {reason}
            </li>
          ))}
        </ul>
      )}

      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-forest">
          {String(t.docsApply)}
          <ChevronDown
            size={16}
            className="transition group-open:rotate-180"
          />
        </summary>

        <div className="mt-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            {scheme.required_documents.map((document) => (
              <span
                key={document}
                className="flex items-center gap-1 rounded-full border border-forest/10 bg-cream px-3 py-1.5 text-xs font-semibold text-forest"
              >
                <FileCheck2 size={13} className="text-leaf" />
                {document}
              </span>
            ))}
          </div>

          <p className="text-xs leading-5 text-muted">
            {scheme.application_mode}
          </p>

          {scheme.helpline && (
            <p className="text-xs font-semibold text-forest">
              {String(t.helpline)}: {scheme.helpline}
            </p>
          )}
        </div>
      </details>

      <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-3">
        <p className="text-[11px] text-muted">
          {String(t.sourceVerified)} {scheme.last_verified}
        </p>

        <a
          href={scheme.official_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-bold text-white"
        >
          {String(t.apply)}
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
