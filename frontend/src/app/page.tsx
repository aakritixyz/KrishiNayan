"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ActivitySquare,
  ArrowRight,
  BrainCircuit,
  Camera,
  CloudOff,
  CloudSun,
  Headphones,
  HeartPulse,
  Landmark,
  Layers,
  LockKeyhole,
  LogIn,
  MapPinned,
  Radar,
  ScanLine,
  ShieldCheck,
  Siren,
  Sparkles,
  Sprout,
  UserRound,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import BrandMark from "@/components/BrandMark";
import BottomNav from "@/components/BottomNav";
import LanguageSelector from "@/components/LanguageSelector";
import GuestGateModal from "@/components/GuestGateModal";
import { useAuth } from "@/lib/auth-context";
import { apiJson } from "@/lib/api";
import { useLanguage, type Language } from "@/lib/language-context";
import {
  fetchBrowserOpenMeteoWeather,
  shouldUseBrowserWeatherFallback,
} from "@/lib/live-weather";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const HOME_TEXT: Record<
  Language,
  {
    offlineReady: string;
    login: string;
    guestPreview: string;
    guestMode: string;
    finishProfile: string;
    copilot: string;
    subtitle: string;
    pune: string;
    locating: string;
    weatherUnavailable: string;
    scanCrop: string;
    myFarm: string;
    viewPlots: string;
    askExpert: string;
    expertSupport: string;
    cropHealth: string;
    cropHealthDesc: string;
    govtSchemes: string;
    govtSchemesDesc: string;
    impactEyebrow: string;
    impactTitle: string;
    impactBody: string;
    farmersLabel: string;
    smallFarmersLabel: string;
    fpoLabel: string;
    lossLabel: string;
    proofLine: string;
    fieldProof: string;
    sourcesLine: string;
    confidenceTitle: string;
    confidenceBody: string;
    outbreakTitle: string;
    outbreakBody: string;
    offlineTitle: string;
    offlineBody: string;
    profileFeature: string;
    scanFeature: string;
    farmFeature: string;
    expertFeature: string;
    healthFeature: string;
    schemesFeature: string;
    imageAlt: string;
  }
> = {
  en: {
    offlineReady: "Offline Ready",
    login: "Log in",
    guestPreview: "Guest preview · features are locked",
    guestMode: "Guest mode · browse freely, actions are read-only",
    finishProfile: "Finish setting up your farm profile →",
    copilot: "Farmer Care Companion",
    subtitle: "From crop photo to clear action",
    pune: "Pune",
    locating: "Locating...",
    weatherUnavailable: "Weather unavailable",
    scanCrop: "Scan Crop",
    myFarm: "My Farm",
    viewPlots: "View your plots",
    askExpert: "Ask Expert",
    expertSupport: "Crop care chat + KVK support",
    cropHealth: "Crop Health Memory",
    cropHealthDesc: "Track health scores and trends over time",
    govtSchemes: "Government Schemes",
    govtSchemesDesc: "Check what you're eligible for",
    impactEyebrow: "Why this matters",
    impactTitle: "Built for the farmers most exposed to crop loss",
    impactBody:
      "KrishiNayan turns each scan into plot memory, recovery action and local outbreak intelligence for officers and FPOs.",
    farmersLabel: "operational farm holdings in India",
    smallFarmersLabel: "are small or marginal holdings",
    fpoLabel: "FPOs targeted under GoI scheme",
    lossLabel: "crop yields lost to pests/diseases yearly",
    proofLine: "90.5% rice field accuracy · 86% answered · 70% confidence gate",
    fieldProof: "Field proof",
    sourcesLine: "Sources: Agriculture Census 2015-16, GoI FPO scheme, FAO",
    confidenceTitle: "Confidence, not guesses",
    confidenceBody:
      "Below 70%, it says “uncertain” instead of risking a wrong call.",
    outbreakTitle: "Early outbreak warning",
    outbreakBody:
      "Scan clusters surface to block-level officers as local signals.",
    offlineTitle: "Works offline",
    offlineBody:
      "Core pages and recent advice stay available on weak networks.",
    profileFeature: "your profile",
    scanFeature: "crop scanning and saved diagnoses",
    farmFeature: "My Farm",
    expertFeature: "crop expert support",
    healthFeature: "Crop Health Memory",
    schemesFeature: "personalised government scheme eligibility",
    imageAlt: "Farmers working together in a rice field",
  },
  hi: {
    offlineReady: "ऑफ़लाइन उपलब्ध",
    login: "लॉग इन",
    guestPreview: "अतिथि पूर्वावलोकन · सुविधाएँ लॉक हैं",
    guestMode: "अतिथि मोड · स्वतंत्र रूप से देखें, कार्रवाइयाँ केवल पढ़ने के लिए हैं",
    finishProfile: "अपनी खेत प्रोफ़ाइल पूरी करें →",
    copilot: "किसान देखभाल साथी",
    subtitle: "फसल की फोटो से स्पष्ट समाधान तक",
    pune: "पुणे",
    locating: "स्थान खोजा जा रहा है...",
    weatherUnavailable: "मौसम उपलब्ध नहीं",
    scanCrop: "फसल स्कैन करें",
    myFarm: "मेरा खेत",
    viewPlots: "अपने खेत देखें",
    askExpert: "विशेषज्ञ से पूछें",
    expertSupport: "फसल देखभाल चैट + केवीके सहायता",
    cropHealth: "फसल स्वास्थ्य रिकॉर्ड",
    cropHealthDesc: "समय के साथ स्वास्थ्य स्कोर और रुझान देखें",
    govtSchemes: "सरकारी योजनाएँ",
    govtSchemesDesc: "देखें कि आप किन योजनाओं के लिए पात्र हैं",
    impactEyebrow: "यह क्यों ज़रूरी है",
    impactTitle: "उन किसानों के लिए बनाया गया जो फसल नुकसान से सबसे ज़्यादा प्रभावित होते हैं",
    impactBody:
      "KrishiNayan हर स्कैन को प्लॉट रिकॉर्ड, रिकवरी कदम और अधिकारियों/FPOs के लिए स्थानीय प्रकोप संकेत में बदलता है।",
    farmersLabel: "भारत में परिचालन कृषि जोत",
    smallFarmersLabel: "छोटी या सीमांत जोत हैं",
    fpoLabel: "भारत सरकार योजना के तहत FPO लक्ष्य",
    lossLabel: "हर साल कीट/रोगों से फसल उपज नुकसान",
    proofLine: "90.5% धान फील्ड सटीकता · 86% उत्तर दिए · 70% भरोसा सीमा",
    fieldProof: "फील्ड प्रमाण",
    sourcesLine: "स्रोत: कृषि जनगणना 2015-16, भारत सरकार FPO योजना, FAO",
    confidenceTitle: "भरोसा, अनुमान नहीं",
    confidenceBody:
      "70% से कम भरोसे पर यह गलत अनुमान लगाने के बजाय “अनिश्चित” कहता है।",
    outbreakTitle: "जल्दी प्रकोप चेतावनी",
    outbreakBody:
      "स्कैन समूह ब्लॉक-स्तर के अधिकारियों तक स्थानीय संकेत के रूप में पहुँचते हैं।",
    offlineTitle: "ऑफ़लाइन भी काम करता है",
    offlineBody:
      "कमज़ोर नेटवर्क में मुख्य पेज और हाल की सलाह उपलब्ध रहती है।",
    profileFeature: "आपकी प्रोफ़ाइल",
    scanFeature: "फसल स्कैन और सहेजे गए निदान",
    farmFeature: "मेरा खेत",
    expertFeature: "फसल विशेषज्ञ सहायता",
    healthFeature: "फसल स्वास्थ्य रिकॉर्ड",
    schemesFeature: "व्यक्तिगत सरकारी योजना पात्रता",
    imageAlt: "धान के खेत में साथ काम करते किसान",
  },
  pa: {
    offlineReady: "ਆਫ਼ਲਾਈਨ ਤਿਆਰ",
    login: "ਲੌਗ ਇਨ",
    guestPreview: "ਮਹਿਮਾਨ ਝਲਕ · ਸੁਵਿਧਾਵਾਂ ਲੌਕ ਹਨ",
    guestMode: "ਮਹਿਮਾਨ ਮੋਡ · ਆਜ਼ਾਦੀ ਨਾਲ ਵੇਖੋ, ਕਾਰਵਾਈਆਂ ਸਿਰਫ਼ ਪੜ੍ਹਨ ਲਈ ਹਨ",
    finishProfile: "ਆਪਣੀ ਖੇਤ ਪ੍ਰੋਫ਼ਾਈਲ ਪੂਰੀ ਕਰੋ →",
    copilot: "ਕਿਸਾਨ ਦੇਖਭਾਲ ਸਾਥੀ",
    subtitle: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਤੋਂ ਸਪਸ਼ਟ ਕਾਰਵਾਈ ਤੱਕ",
    pune: "ਪੁਣੇ",
    locating: "ਟਿਕਾਣਾ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    weatherUnavailable: "ਮੌਸਮ ਉਪਲਬਧ ਨਹੀਂ",
    scanCrop: "ਫਸਲ ਸਕੈਨ ਕਰੋ",
    myFarm: "ਮੇਰਾ ਖੇਤ",
    viewPlots: "ਆਪਣੇ ਖੇਤ ਵੇਖੋ",
    askExpert: "ਮਾਹਿਰ ਨੂੰ ਪੁੱਛੋ",
    expertSupport: "ਫਸਲ ਸੰਭਾਲ ਚੈਟ + ਕੇਵੀਕੇ ਸਹਾਇਤਾ",
    cropHealth: "ਫਸਲ ਸਿਹਤ ਰਿਕਾਰਡ",
    cropHealthDesc: "ਸਮੇਂ ਨਾਲ ਸਿਹਤ ਸਕੋਰ ਅਤੇ ਰੁਝਾਨ ਵੇਖੋ",
    govtSchemes: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ",
    govtSchemesDesc: "ਵੇਖੋ ਤੁਸੀਂ ਕਿਹੜੀਆਂ ਯੋਜਨਾਵਾਂ ਲਈ ਯੋਗ ਹੋ",
    impactEyebrow: "ਇਹ ਕਿਉਂ ਜ਼ਰੂਰੀ ਹੈ",
    impactTitle: "ਉਨ੍ਹਾਂ ਕਿਸਾਨਾਂ ਲਈ ਬਣਿਆ ਜੋ ਫਸਲ ਨੁਕਸਾਨ ਦੇ ਸਭ ਤੋਂ ਵੱਧ ਜੋਖਮ ਵਿੱਚ ਹਨ",
    impactBody:
      "KrishiNayan ਹਰ ਸਕੈਨ ਨੂੰ ਪਲਾਟ ਰਿਕਾਰਡ, ਰਿਕਵਰੀ ਕਾਰਵਾਈ ਅਤੇ ਅਧਿਕਾਰੀਆਂ/FPOs ਲਈ ਸਥਾਨਕ ਫੈਲਾਅ ਸੰਕੇਤ ਬਣਾਉਂਦਾ ਹੈ।",
    farmersLabel: "ਭਾਰਤ ਵਿੱਚ ਆਪਰੇਸ਼ਨਲ ਖੇਤੀ ਹੋਲਡਿੰਗਜ਼",
    smallFarmersLabel: "ਛੋਟੀ ਜਾਂ ਸੀਮਾਂਤ ਹੋਲਡਿੰਗਜ਼ ਹਨ",
    fpoLabel: "ਭਾਰਤ ਸਰਕਾਰ ਯੋਜਨਾ ਹੇਠ FPO ਟੀਚਾ",
    lossLabel: "ਹਰ ਸਾਲ ਕੀੜਿਆਂ/ਰੋਗਾਂ ਨਾਲ ਫਸਲ ਉਪਜ ਨੁਕਸਾਨ",
    proofLine: "90.5% ਧਾਨ ਫੀਲਡ ਸਹੀਪਣ · 86% ਜਵਾਬ ਦਿੱਤੇ · 70% ਭਰੋਸਾ ਸੀਮਾ",
    fieldProof: "ਫੀਲਡ ਸਬੂਤ",
    sourcesLine: "ਸਰੋਤ: ਖੇਤੀ ਜਨਗਣਨਾ 2015-16, ਭਾਰਤ ਸਰਕਾਰ FPO ਯੋਜਨਾ, FAO",
    confidenceTitle: "ਭਰੋਸਾ, ਅੰਦਾਜ਼ਾ ਨਹੀਂ",
    confidenceBody:
      "70% ਤੋਂ ਘੱਟ ਭਰੋਸੇ ਤੇ ਗਲਤ ਕਹਿਣ ਦੀ ਬਜਾਏ ਇਹ “ਅਨਿਸ਼ਚਿਤ” ਦੱਸਦਾ ਹੈ।",
    outbreakTitle: "ਜਲਦੀ ਫੈਲਾਅ ਚੇਤਾਵਨੀ",
    outbreakBody:
      "ਸਕੈਨ ਸਮੂਹ ਬਲਾਕ-ਪੱਧਰ ਦੇ ਅਧਿਕਾਰੀਆਂ ਤੱਕ ਸਥਾਨਕ ਸੰਕੇਤ ਵਜੋਂ ਪਹੁੰਚਦੇ ਹਨ।",
    offlineTitle: "ਆਫ਼ਲਾਈਨ ਵੀ ਚੱਲਦਾ ਹੈ",
    offlineBody:
      "ਕਮਜ਼ੋਰ ਨੈੱਟਵਰਕ ਵਿੱਚ ਮੁੱਖ ਪੇਜ ਅਤੇ ਤਾਜ਼ਾ ਸਲਾਹ ਉਪਲਬਧ ਰਹਿੰਦੀ ਹੈ।",
    profileFeature: "ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ",
    scanFeature: "ਫਸਲ ਸਕੈਨ ਅਤੇ ਸੇਵ ਕੀਤੀ ਜਾਂਚ",
    farmFeature: "ਮੇਰਾ ਖੇਤ",
    expertFeature: "ਫਸਲ ਮਾਹਿਰ ਸਹਾਇਤਾ",
    healthFeature: "ਫਸਲ ਸਿਹਤ ਰਿਕਾਰਡ",
    schemesFeature: "ਨਿੱਜੀ ਸਰਕਾਰੀ ਯੋਜਨਾ ਯੋਗਤਾ",
    imageAlt: "ਧਾਨ ਦੇ ਖੇਤ ਵਿੱਚ ਇਕੱਠੇ ਕੰਮ ਕਰਦੇ ਕਿਸਾਨ",
  },
  mr: {
    offlineReady: "ऑफलाइन उपलब्ध",
    login: "लॉग इन",
    guestPreview: "अतिथी पूर्वदृश्य · सुविधा लॉक आहेत",
    guestMode: "अतिथी मोड · मोकळेपणाने पाहा, कृती फक्त वाचनासाठी आहेत",
    finishProfile: "तुमची शेत प्रोफाइल पूर्ण करा →",
    copilot: "शेतकरी काळजी साथी",
    subtitle: "पिकाच्या फोटोमधून स्पष्ट कृतीपर्यंत",
    pune: "पुणे",
    locating: "स्थान शोधत आहे...",
    weatherUnavailable: "हवामान उपलब्ध नाही",
    scanCrop: "पीक स्कॅन करा",
    myFarm: "माझे शेत",
    viewPlots: "तुमचे प्लॉट पहा",
    askExpert: "तज्ज्ञांना विचारा",
    expertSupport: "पीक काळजी चॅट + केव्हीके सहाय्य",
    cropHealth: "पीक आरोग्य नोंद",
    cropHealthDesc: "काळानुसार आरोग्य गुण आणि कल पहा",
    govtSchemes: "सरकारी योजना",
    govtSchemesDesc: "तुम्ही कोणत्या योजनांसाठी पात्र आहात ते पहा",
    impactEyebrow: "हे का महत्त्वाचे आहे",
    impactTitle: "पीक नुकसानीचा सर्वाधिक धोका असलेल्या शेतकऱ्यांसाठी",
    impactBody:
      "KrishiNayan प्रत्येक स्कॅनला प्लॉट नोंद, पुनर्प्राप्ती कृती आणि अधिकारी/FPOs साठी स्थानिक प्रादुर्भाव संकेत बनवते.",
    farmersLabel: "भारतातील कार्यरत शेती जोत",
    smallFarmersLabel: "लहान किंवा अल्पभूधारक जोत आहेत",
    fpoLabel: "भारत सरकार योजनेतील FPO लक्ष्य",
    lossLabel: "दरवर्षी कीड/रोगांमुळे पीक उत्पादन नुकसान",
    proofLine: "90.5% भात फील्ड अचूकता · 86% उत्तर दिले · 70% विश्वास मर्यादा",
    fieldProof: "फील्ड पुरावा",
    sourcesLine: "स्रोत: कृषी जनगणना 2015-16, भारत सरकार FPO योजना, FAO",
    confidenceTitle: "विश्वास, अंदाज नाही",
    confidenceBody:
      "70% पेक्षा कमी विश्वास असल्यास चुकीचा अंदाज न देता ते “अनिश्चित” म्हणते.",
    outbreakTitle: "लवकर प्रादुर्भाव इशारा",
    outbreakBody:
      "स्कॅन समूह तालुका-स्तरीय अधिकाऱ्यांपर्यंत स्थानिक संकेत म्हणून पोहोचतात.",
    offlineTitle: "ऑफलाइनही चालते",
    offlineBody:
      "कमकुवत नेटवर्कमध्ये मुख्य पाने आणि अलीकडील सल्ला उपलब्ध राहतो.",
    profileFeature: "तुमची प्रोफाइल",
    scanFeature: "पीक स्कॅन आणि जतन केलेले निदान",
    farmFeature: "माझे शेत",
    expertFeature: "पीक तज्ज्ञ मदत",
    healthFeature: "पीक आरोग्य नोंद",
    schemesFeature: "वैयक्तिक सरकारी योजना पात्रता",
    imageAlt: "भाताच्या शेतात एकत्र काम करणारे शेतकरी",
  },
};

/**
 * Copy for the new storytelling sections below the hero (flow, field
 * intelligence, field memory, outbreak intelligence, closing CTA).
 * These sections are presented in English for now — the hero, nav and
 * every functional screen remain fully localized via HOME_TEXT above.
 * No new statistics are introduced here; every number reused below
 * already exists in HOME_TEXT and is sourced in `sourcesLine`.
 */
const STORY_TEXT = {
  flowEyebrow: "How it works",
  flowTitle: "A photograph becomes field intelligence.",
  flowBody:
    "Every scan moves through the same clear path — from what's growing in your field to a next step you can act on today.",
  flowSteps: [
    {
      label: "Field",
      title: "Your crop, as it stands",
      body: "A photo from your phone, taken right where the plant is growing.",
    },
    {
      label: "Scan",
      title: "Captured in seconds",
      body: "The photo is checked against crop stage, recent weather and plot history.",
    },
    {
      label: "Understand",
      title: "A clear read, not a guess",
      body: "KrishiNayan names what it sees — and says \"uncertain\" below its confidence gate rather than risk a wrong call.",
    },
    {
      label: "Act",
      title: "A next step you can take",
      body: "Treatment, timing and cost guidance suited to your crop and your plot.",
    },
    {
      label: "Recover",
      title: "Followed through to the end",
      body: "Recovery tasks and a recheck scan keep the plot's story connected.",
    },
  ],
  fieldEyebrow: "Field intelligence",
  fieldTitle: "Every plot, remembered.",
  fieldBody:
    "Each scan is saved against the plot it came from, so patterns across your field become visible over time — not just one photo in isolation.",
  fieldNote: "Illustrative preview",
  fieldCta: "Open My Farm",
  fieldPlots: [
    { name: "Plot A", crop: "Rice", status: "Healthy", tone: "good" as const, x: 22, y: 32 },
    { name: "Plot B", crop: "Tomato", status: "Watch: early blight", tone: "watch" as const, x: 64, y: 22 },
    { name: "Plot C", crop: "Wheat", status: "Healthy", tone: "good" as const, x: 40, y: 62 },
    { name: "Plot D", crop: "Cotton", status: "Needs review", tone: "alert" as const, x: 78, y: 68 },
  ],
  memoryEyebrow: "Field memory",
  memoryTitle: "Recovery, tracked day by day.",
  memoryBody:
    "From the moment an issue is found, KrishiNayan lays out a recovery plan and keeps score as each step is completed — the same plan you'll find on the Recovery page.",
  memoryCta: "View recovery plans",
  memorySteps: [
    { day: "Day 0", title: "Issue identified", desc: "Scan result saved to the plot's record." },
    { day: "Day 1", title: "Recommended action", desc: "Treatment and timing suited to the crop stage." },
    { day: "Day 3", title: "Treatment applied", desc: "Task marked complete on the recovery plan." },
    { day: "Day 7", title: "Recheck scan", desc: "A follow-up photo compares progress against Day 0." },
    { day: "Day 14", title: "Plot recovered", desc: "Health score and history stay on file for next season." },
  ],
  outbreakEyebrow: "Outbreak intelligence",
  outbreakCta: "See nearby alerts",
  storyEyebrow: "Why this matters",
  storyCta: "Read the field proof",
  finalEyebrow: "Ready when your field is",
  finalTitle: "See what your field is telling you.",
  finalBody:
    "Point your camera at the plant. KrishiNayan handles the rest — diagnosis, next steps and a plan to recover.",
  finalCta: "Scan your crop",
};

/** Fixed (non-random) seeds for the hero's ambient particles, so
 * server-rendered and client-rendered markup always match. */
const PARTICLE_SEEDS = [
  { left: 8, bottom: 10, size: "4px", duration: 11, delay: 0 },
  { left: 18, bottom: 4, size: "3px", duration: 13, delay: 2 },
  { left: 30, bottom: 18, size: "5px", duration: 10, delay: 4 },
  { left: 46, bottom: 8, size: "3px", duration: 14, delay: 1 },
  { left: 58, bottom: 22, size: "4px", duration: 12, delay: 5 },
  { left: 70, bottom: 6, size: "3px", duration: 15, delay: 3 },
  { left: 82, bottom: 16, size: "5px", duration: 11, delay: 6 },
  { left: 92, bottom: 2, size: "3px", duration: 13, delay: 2.5 },
];

const LOCATION_TRANSLATIONS: Record<
  string,
  Record<Language, string>
> = {
  pune: { en: "Pune", hi: "पुणे", pa: "ਪੁਣੇ", mr: "पुणे" },
  wagholi: { en: "Wagholi", hi: "वाघोली", pa: "ਵਾਘੋਲੀ", mr: "वाघोली" },
  mumbai: { en: "Mumbai", hi: "मुंबई", pa: "ਮੁੰਬਈ", mr: "मुंबई" },
  nagpur: { en: "Nagpur", hi: "नागपुर", pa: "ਨਾਗਪੁਰ", mr: "नागपूर" },
  nashik: { en: "Nashik", hi: "नासिक", pa: "ਨਾਸਿਕ", mr: "नाशिक" },
  kolhapur: { en: "Kolhapur", hi: "कोल्हापुर", pa: "ਕੋਲਹਾਪੁਰ", mr: "कोल्हापूर" },
  delhi: { en: "Delhi", hi: "दिल्ली", pa: "ਦਿੱਲੀ", mr: "दिल्ली" },
  "new delhi": { en: "New Delhi", hi: "नई दिल्ली", pa: "ਨਵੀਂ ਦਿੱਲੀ", mr: "नवी दिल्ली" },
  maharashtra: { en: "Maharashtra", hi: "महाराष्ट्र", pa: "ਮਹਾਰਾਸ਼ਟਰ", mr: "महाराष्ट्र" },
  bihar: { en: "Bihar", hi: "बिहार", pa: "ਬਿਹਾਰ", mr: "बिहार" },
  punjab: { en: "Punjab", hi: "पंजाब", pa: "ਪੰਜਾਬ", mr: "पंजाब" },
  haryana: { en: "Haryana", hi: "हरियाणा", pa: "ਹਰਿਆਣਾ", mr: "हरियाणा" },
  telangana: { en: "Telangana", hi: "तेलंगाना", pa: "ਤੇਲੰਗਾਨਾ", mr: "तेलंगणा" },
  "uttar pradesh": { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", pa: "ਉੱਤਰ ਪ੍ਰਦੇਸ਼", mr: "उत्तर प्रदेश" },
};

function localizeLocationName(
  locationName: string | null | undefined,
  language: Language
) {
  if (!locationName) return null;

  const clean = locationName.trim();
  const exact = LOCATION_TRANSLATIONS[clean.toLowerCase()];
  if (exact) return exact[language];

  // Handle responses such as "Wagholi, Pune" or "Pune, Maharashtra".
  const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);

  return parts
    .map((part) => {
      const translated = LOCATION_TRANSLATIONS[part.toLowerCase()];
      return translated ? translated[language] : part;
    })
    .join(", ");
}

type HomeWeather = {
  latitude: number;
  longitude: number;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  rain: number | null;
  rain_expected: boolean;
  weather_code?: number | null;
  location_name?: string | null;
  source: string;
};

export default function Home() {
  const { user, isLoading, isGuest } = useAuth();
  const { language } = useLanguage();
  const t = HOME_TEXT[language];

  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [guestFeature, setGuestFeature] = useState<string | null>(null);
  const [weather, setWeather] = useState<HomeWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const data = await apiJson<HomeWeather>(
            `/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&language=${language}`
          );

          if (shouldUseBrowserWeatherFallback(data)) {
            try {
              const liveWeather = await fetchBrowserOpenMeteoWeather(
                latitude,
                longitude
              );

              setWeather({
                ...data,
                ...liveWeather,
                latitude,
                longitude,
                location_name: data.location_name,
              });
              return;
            } catch {
              // Keep the backend response if the browser-side provider call
              // is also unavailable.
            }
          }

          setWeather(data);
        } catch {
          setWeather(null);
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeather(null);
        setWeatherLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, [language]);

  useEffect(() => {
    if (!isLoading && user?.role === "officer") router.replace("/officer");
  }, [user, isLoading, router]);

  if (user?.role === "officer") return null;

  function gated(path: string, feature: string) {
    if (user || isGuest) router.push(path);
    else setGuestFeature(feature);
  }

  return (
    <main className="app-main app-main--home flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative w-full max-w-[430px] overflow-hidden app-frame app-frame--home bg-forest-deep sm:rounded-[32px] lg:max-w-none">
        {/* ---------------------------------------------------------- */}
        {/* HERO — first screen of the story: "From crop photo to      */}
        {/* clear action."                                             */}
        {/* ---------------------------------------------------------- */}
        <div className="relative min-h-screen w-full overflow-hidden grain">
        <Image src="/images/farmers-field.jpg" alt={t.imageAlt} fill priority sizes="(min-width: 1024px) 1120px, (max-width: 640px) 100vw, 430px" className="object-cover" />
        {/* Light image overlay — keeps the field visible while maintaining
            enough contrast for the white text. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-forest-deep/35"
        />
        {/* Soft bottom vignette for text readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-forest-deep/35 via-transparent to-transparent"
        />
        {/* Very subtle left-side depth on desktop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-forest-deep/20 via-transparent to-transparent lg:block"
        />

        {/* Atmospheric particles — pure CSS, respects reduced motion */}
        {!reduceMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {PARTICLE_SEEDS.map((p, i) => (
              <span
                key={i}
                className="particle"
                style={{
                  left: `${p.left}%`,
                  bottom: `${p.bottom}%`,
                  width: p.size,
                  height: p.size,
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="home-content relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 pb-28 pt-8 text-center lg:grid lg:min-h-full lg:grid-cols-[minmax(460px,0.95fr)_minmax(500px,1.05fr)] lg:items-center lg:gap-10 lg:px-16 lg:py-8 lg:text-left xl:gap-16 xl:px-20">
          {/* Left: identity, hero copy, primary action */}
          <div className="flex w-full flex-col items-center lg:items-start">
            <BrandMark className="mb-4 h-16 w-16 lg:hidden" />

            <div className="mb-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <LanguageSelector variant="dark" />
              <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm lg:hidden">
                <CloudOff size={16} />
                <span>{t.offlineReady}</span>
              </div>

              {!isLoading && (user ? (
                <button type="button" onClick={() => gated("/profile", t.profileFeature)} className="flex items-center gap-2 rounded-full border border-leaf/50 bg-leaf/15 px-4 py-2 text-sm font-medium text-white lg:hidden">
                  <UserRound size={16} className="text-leaf" />
                  <span>{user.full_name.split(" ")[0]}</span>
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <LogIn size={16} />
                  <span>{t.login}</span>
                </Link>
              ))}
            </div>

            {isGuest && !isLoading && (
              <div className="mb-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm">
                <LockKeyhole size={14} className="text-leaf" />
                {t.guestMode}
              </div>
            )}

            {user && !user.profile_completed && (
              <Link href="/onboarding" className="mb-4 flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-xs font-bold text-forest-deep shadow-lg">
                {t.finishProfile}
              </Link>
            )}

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf/90">{t.copilot}</p>
            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-white lg:text-[4.25rem] lg:leading-[1.02]">KrishiNayan</h1>
            <p className="mt-4 max-w-xs text-base leading-7 text-white/75 lg:max-w-md lg:text-lg">{t.subtitle}</p>

            <div className="mt-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-semibold text-forest-deep shadow-lg">
              <CloudSun size={20} className="text-warning" />
              <span>
                {weatherLoading
                  ? t.locating
                  : weather?.temperature !== null && weather?.temperature !== undefined
                  ? `${Math.round(weather.temperature)}°C · ${localizeLocationName(weather.location_name, language) || t.weatherUnavailable}`
                  : t.weatherUnavailable}
              </span>
            </div>

            <FeatureButton onClick={() => gated("/scan", t.scanFeature)} className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-leaf px-6 py-4 text-lg font-bold text-forest-deep shadow-lg lg:max-w-sm">
              <Camera size={24} strokeWidth={2.2} />
              <span>{t.scanCrop}</span>
              {!user && !isGuest && <LockKeyhole size={17} />}
            </FeatureButton>
          </div>

          {/* Right: at-a-glance briefing (desktop) + quick actions (mobile only) */}
          <div className="mt-6 w-full lg:mt-0">
            {/* Desktop: one cohesive panel — the sidebar already handles navigation */}
            <aside className="hidden w-full max-w-[560px] lg:ml-auto lg:block">
              <div className="max-h-[calc(100vh-56px)] overflow-hidden rounded-[28px] border border-white/20 bg-forest-deep/55 p-5 text-white shadow-[0_24px_70px_rgba(3,39,31,0.30)] backdrop-blur-md xl:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf/90">{t.impactEyebrow}</p>
                <h2 className="mt-3 text-[1.45rem] font-extrabold leading-tight text-white xl:text-2xl">
                  {t.impactTitle}
                </h2>
                <p className="mt-2 text-sm leading-5 text-white/62 xl:leading-6">
                  {t.impactBody}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
                  <HeroMetric value="146M" label={t.farmersLabel} />
                  <HeroMetric value="86%" label={t.smallFarmersLabel} />
                  <HeroMetric value="10K" label={t.fpoLabel} />
                  <HeroMetric value="20-40%" label={t.lossLabel} />
                </div>

                <div className="mt-3 rounded-2xl border border-leaf/20 bg-leaf/10 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf/90">
                    {t.fieldProof}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-white/82">
                    {t.proofLine}
                  </p>
                </div>

                <div className="my-4 h-px bg-white/12" />

                <ul className="grid gap-3">
                  <TrustRow
                    icon={<ShieldCheck size={18} />}
                    title={t.confidenceTitle}
                    body={t.confidenceBody}
                  />
                  <TrustRow
                    icon={<Siren size={18} />}
                    title={t.outbreakTitle}
                    body={t.outbreakBody}
                  />
                  <TrustRow
                    icon={<CloudOff size={18} />}
                    title={t.offlineTitle}
                    body={t.offlineBody}
                  />
                </ul>
                <p className="mt-4 text-[11px] leading-4 text-white/40">
                  {t.sourcesLine}
                </p>
              </div>
            </aside>

            {/* Mobile: quick actions (no sidebar on small screens) */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              <FeatureButton onClick={() => gated("/farm", t.farmFeature)} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
                <MapPinned size={24} className="shrink-0 text-leaf" />
                <span>
                  <span className="block font-semibold">{t.myFarm}</span>
                  <span className="mt-1 block text-xs text-white/65">{t.viewPlots}</span>
                </span>
                {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
              </FeatureButton>

              <FeatureButton onClick={() => gated("/chatbot", t.expertFeature)} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
                <Headphones size={24} className="shrink-0 text-leaf" />
                <span>
                  <span className="block font-semibold">{t.askExpert}</span>
                  <span className="mt-1 block text-xs text-white/65">{t.expertSupport}</span>
                </span>
                {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
              </FeatureButton>

              <FeatureButton onClick={() => gated("/health", t.healthFeature)} className="col-span-2 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf">
                  <ActivitySquare size={22} />
                </span>
                <span>
                  <span className="block font-semibold">{t.cropHealth}</span>
                  <span className="mt-1 block text-xs text-white/65">{t.cropHealthDesc}</span>
                </span>
                {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
              </FeatureButton>

              <FeatureButton onClick={() => gated("/policies", t.schemesFeature)} className="col-span-2 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf">
                  <Landmark size={22} />
                </span>
                <span>
                  <span className="block font-semibold">{t.govtSchemes}</span>
                  <span className="mt-1 block text-xs text-white/65">{t.govtSchemesDesc}</span>
                </span>
                {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
              </FeatureButton>
            </div>
          </div>
        </div>

        {/* Scroll cue — hidden once motion is reduced */}
        {!reduceMotion && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-24 z-10 hidden justify-center lg:flex"
          >
            <div className="flex animate-drift-slow flex-col items-center gap-1 text-white/45">
              <span className="section-eyebrow">Scroll</span>
              <span className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
            </div>
          </div>
        )}
        </div>
        {/* ---------------------------------------------------------- */}
        {/* END HERO                                                   */}
        {/* ---------------------------------------------------------- */}

        <FlowSection reduceMotion={Boolean(reduceMotion)} />
        <FieldIntelligenceSection onOpenFarm={() => gated("/farm", t.farmFeature)} />
        <FieldMemorySection onOpenRecovery={() => gated("/recovery", t.healthFeature)} />
        <OutbreakSection body={t.outbreakBody} onOpenAlerts={() => gated("/alerts", "nearby outbreak alerts")} />
        <StorySection t={t} />
        <FinalCtaSection onScan={() => gated("/scan", t.scanFeature)} />
      </section>

      {/* Fixed wrapper keeps the mobile tab bar pinned to the viewport
          across the whole scrollable story, without altering BottomNav's
          own (shared, `absolute`) positioning used on every other page. */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <BottomNav />
      </div>

      <GuestGateModal
        open={Boolean(guestFeature)}
        onClose={() => setGuestFeature(null)}
        feature={guestFeature || undefined}
      />
    </main>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-h-[86px] rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center">
      <p className="text-[1.65rem] font-extrabold leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase leading-4 tracking-wide text-white/50">
        {label}
      </p>
    </div>
  );
}

function TrustRow({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf text-forest-deep">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold leading-5">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-white/60">{body}</p>
      </div>
    </li>
  );
}

/* ============================================================== */
/* STORYTELLING SECTIONS — Field → Scan → Understand → Act →       */
/* Recover. Rendered below the hero, inside the same scrollable    */
/* app-frame. Dark/cream sections alternate for editorial rhythm.  */
/* ============================================================== */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const FLOW_ICONS = [Sprout, ScanLine, BrainCircuit, Wrench, HeartPulse];

function FlowSection({ reduceMotion }: { reduceMotion: boolean }) {
  const s = STORY_TEXT;
  return (
    <section className="relative bg-cream px-6 py-20 text-forest-deep sm:px-10 lg:px-16 xl:px-20 xl:py-28">
      <motion.div
        initial={reduceMotion ? undefined : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="section-eyebrow text-forest-light">{s.flowEyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-balance leading-[1.1] sm:text-4xl xl:text-[2.75rem]">
          {s.flowTitle}
        </h2>
        <p className="mt-4 text-base leading-7 text-forest-deep/65">{s.flowBody}</p>
      </motion.div>

      <motion.div
        initial={reduceMotion ? undefined : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        className="relative mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3"
      >
        {/* connecting line, desktop only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-forest-deep/15 to-transparent lg:block"
        />
        {s.flowSteps.map((step, i) => {
          const Icon = FLOW_ICONS[i];
          const isScanStep = i === 1;
          return (
            <motion.div
              key={step.label}
              variants={fadeUp}
              className="relative flex flex-col rounded-2xl border border-forest-deep/8 bg-white/70 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-deep text-leaf">
                  <Icon size={16} strokeWidth={2.2} />
                </span>
                <span className="section-eyebrow text-forest-deep/40">
                  0{i + 1} · {step.label}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-forest-deep/60">{step.body}</p>

              {isScanStep && <ScanVisual />}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/** Small futuristic scan animation: a sweeping scan-line and AI-style
 * detection brackets over a crop photo. Pure CSS keyframes; respects
 * prefers-reduced-motion globally via globals.css. */
function ScanVisual() {
  return (
    <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-forest-deep/10">
      <Image
        src="/images/tomato-field.png"
        alt="Close-up of a tomato plant leaf, illustrating a crop scan"
        fill
        sizes="280px"
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-forest-deep/25" />
      {/* detection brackets */}
      <span className="absolute left-[18%] top-[22%] h-8 w-10 rounded-[3px] border border-leaf/80" />
      <span className="absolute left-[52%] top-[46%] h-9 w-9 rounded-[3px] border border-leaf/80" />
      {/* scan sweep */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-leaf/0 via-leaf/35 to-leaf/0 animate-shimmer"
        style={{ animationDirection: "alternate" }}
      />
    </div>
  );
}

function FieldIntelligenceSection({ onOpenFarm }: { onOpenFarm: () => void }) {
  const s = STORY_TEXT;
  const toneStyles: Record<string, string> = {
    good: "bg-leaf text-leaf",
    watch: "bg-warning text-warning",
    alert: "bg-danger text-danger",
  };

  return (
    <section className="relative overflow-hidden bg-forest-deep px-6 py-20 text-white sm:px-10 lg:px-16 xl:px-20 xl:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 0%, rgba(183,227,0,0.10), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <p className="section-eyebrow text-leaf/80">{s.fieldEyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance leading-[1.1] sm:text-4xl">
            {s.fieldTitle}
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-white/65">{s.fieldBody}</p>
          <button
            type="button"
            onClick={onOpenFarm}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-bold text-forest-deep"
          >
            <Layers size={16} />
            {s.fieldCta}
            <ArrowRight size={15} />
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="relative"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-forest">
            {/* stylised field rows, pure SVG */}
            <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <rect width="400" height="300" fill="#0a3327" />
              {Array.from({ length: 10 }).map((_, i) => (
                <path
                  key={i}
                  d={`M ${i * 42 - 40} 300 L ${i * 42 + 40} 0`}
                  stroke="rgba(183,227,0,0.08)"
                  strokeWidth="14"
                />
              ))}
            </svg>

            {s.fieldPlots.map((plot) => (
              <div
                key={plot.name}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${plot.x}%`, top: `${plot.y}%` }}
              >
                <span className={`relative flex h-3.5 w-3.5 items-center justify-center rounded-full pulse-ring ${toneStyles[plot.tone]}`}>
                  <span className="relative z-10 h-full w-full rounded-full" />
                </span>
                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded-lg border border-white/10 bg-forest-deep/95 px-3 py-2 text-left opacity-0 shadow-xl backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                  <p className="text-xs font-bold text-white">{plot.name} · {plot.crop}</p>
                  <p className="text-[11px] text-white/60">{plot.status}</p>
                </div>
              </div>
            ))}

            <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-forest-deep/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/55 backdrop-blur-sm">
              {s.fieldNote}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FieldMemorySection({ onOpenRecovery }: { onOpenRecovery: () => void }) {
  const s = STORY_TEXT;
  return (
    <section className="relative bg-sand px-6 py-20 text-forest-deep sm:px-10 lg:px-16 xl:px-20 xl:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="max-w-xl"
        >
          <p className="section-eyebrow text-forest-light">{s.memoryEyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance leading-[1.1] sm:text-4xl">
            {s.memoryTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-forest-deep/65">{s.memoryBody}</p>
          <button
            type="button"
            onClick={onOpenRecovery}
            className="mt-7 inline-flex items-center gap-2 rounded-full border-2 border-forest-deep px-5 py-3 text-sm font-bold text-forest-deep"
          >
            <HeartPulse size={16} />
            {s.memoryCta}
            <ArrowRight size={15} />
          </button>
        </motion.div>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-4 hidden h-px bg-forest-deep/12 lg:block"
          />
          {s.memorySteps.map((step, i) => (
            <motion.li key={step.day} variants={fadeUp} className="relative">
              <div className="flex items-center gap-2 lg:block">
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i === s.memorySteps.length - 1
                      ? "bg-leaf text-forest-deep"
                      : "border-2 border-forest-deep bg-sand text-forest-deep"
                  }`}
                >
                  {i + 1}
                </span>
                <p className="section-eyebrow text-forest-deep/45 lg:mt-3">{step.day}</p>
              </div>
              <h3 className="mt-2 font-display text-sm font-bold leading-snug lg:mt-1">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-forest-deep/60">{step.desc}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

function OutbreakSection({
  body,
  onOpenAlerts,
}: {
  body: string;
  onOpenAlerts: () => void;
}) {
  const s = STORY_TEXT;
  // Fixed illustrative intensity grid — not live data. Denser near the
  // centre to suggest a regional cluster, exactly as described in `body`.
  const grid = [
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 2, 2, 1, 0, 0, 0],
    [1, 2, 3, 3, 2, 1, 0, 0],
    [0, 1, 2, 2, 1, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
  ];
  const dotTone = [
    "bg-white/8",
    "bg-warning/40 text-warning",
    "bg-warning/75 text-warning",
    "bg-danger text-danger",
  ];

  return (
    <section className="relative overflow-hidden bg-forest px-6 py-20 text-white sm:px-10 lg:px-16 xl:px-20 xl:py-28">
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="lg:order-2"
        >
          <p className="section-eyebrow text-leaf/80">{s.outbreakEyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance leading-[1.1] sm:text-4xl">
            Signals your neighbours are seeing too.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-white/65">{body}</p>
          <button
            type="button"
            onClick={onOpenAlerts}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-bold text-forest-deep"
          >
            <Siren size={16} />
            {s.outbreakCta}
            <ArrowRight size={15} />
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="lg:order-1"
        >
          <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-forest-deep/60 p-6">
            <div className="flex items-center gap-2 text-white/45">
              <Radar size={16} className="text-leaf" />
              <span className="section-eyebrow">Illustrative preview</span>
            </div>
            <div className="mt-5 grid grid-cols-8 gap-2">
              {grid.flat().map((intensity, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-sm ${dotTone[intensity]} ${
                    intensity >= 2 ? "pulse-ring" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StorySection({ t }: { t: (typeof HOME_TEXT)["en"] }) {
  const s = STORY_TEXT;
  return (
    <section className="relative bg-cream px-6 py-20 text-forest-deep sm:px-10 lg:px-16 xl:px-20 xl:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="section-eyebrow text-forest-light">{s.storyEyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-balance leading-[1.1] sm:text-4xl">
          {t.impactTitle}
        </h2>
        <p className="mt-4 text-base leading-7 text-forest-deep/65">{t.impactBody}</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-4"
      >
        {[
          { value: "146M", label: t.farmersLabel },
          { value: "86%", label: t.smallFarmersLabel },
          { value: "10K", label: t.fpoLabel },
          { value: "20-40%", label: t.lossLabel },
        ].map((m) => (
          <motion.div
            key={m.label}
            variants={fadeUp}
            className="rounded-2xl border border-forest-deep/10 bg-white/70 px-4 py-6 text-center"
          >
            <p className="font-display text-3xl font-extrabold leading-none">{m.value}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase leading-4 tracking-wide text-forest-deep/45">
              {m.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mx-auto mt-6 max-w-4xl rounded-2xl border border-forest-deep/10 bg-forest-deep px-6 py-4 text-center text-white sm:flex sm:items-center sm:justify-between sm:text-left"
      >
        <div>
          <p className="section-eyebrow text-leaf/80">{t.fieldProof}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-white/85">{t.proofLine}</p>
        </div>
        <p className="mt-3 text-[11px] leading-4 text-white/40 sm:mt-0 sm:max-w-[220px] sm:text-right">
          {t.sourcesLine}
        </p>
      </motion.div>
    </section>
  );
}

function FinalCtaSection({ onScan }: { onScan: () => void }) {
  const s = STORY_TEXT;
  return (
    <section className="relative overflow-hidden bg-forest-deep px-6 pb-32 pt-24 text-center text-white sm:px-10 lg:px-16 lg:pb-24 xl:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 30%, rgba(183,227,0,0.14), transparent 65%)",
        }}
      />
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
        className="relative mx-auto max-w-2xl"
      >
        <p className="section-eyebrow text-leaf/80">{s.finalEyebrow}</p>
        <h2 className="mt-4 font-display text-3xl font-bold text-balance leading-[1.08] sm:text-5xl">
          {s.finalTitle}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/65">{s.finalBody}</p>
        <button
          type="button"
          onClick={onScan}
          className="mx-auto mt-9 inline-flex items-center gap-3 rounded-full bg-leaf px-8 py-4 text-base font-bold text-forest-deep shadow-[0_20px_50px_rgba(183,227,0,0.25)]"
        >
          <Camera size={20} strokeWidth={2.2} />
          {s.finalCta}
          <Sparkles size={16} />
        </button>
      </motion.div>
    </section>
  );
}

function FeatureButton({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} transition-all duration-200 hover:-translate-y-0.5 hover:border-leaf/60 hover:shadow-lg active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}
