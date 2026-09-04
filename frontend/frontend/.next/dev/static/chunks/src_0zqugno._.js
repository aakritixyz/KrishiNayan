(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/AccessBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccessBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$keyhole$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockKeyhole$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-keyhole.mjs [app-client] (ecmascript) <export default as LockKeyhole>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GuestGateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GuestGateModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/language-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const FARMER_ONLY_PREFIXES = [
    "/scan",
    "/farm",
    "/alerts",
    "/profile",
    "/onboarding",
    "/health",
    "/chatbot",
    "/recovery",
    "/result",
    "/policies"
];
const ACCESS_TEXT = {
    en: {
        checking: "Checking access...",
        required: "Farmer profile required",
        preview: "You can preview KrishiNayan as a guest, but using farmer features requires a profile.",
        continue: "Continue",
        farmerFeature: "this farmer feature"
    },
    hi: {
        checking: "पहुँच जाँची जा रही है...",
        required: "किसान प्रोफ़ाइल ज़रूरी है",
        preview: "आप KrishiNayan को अतिथि के रूप में देख सकते हैं, लेकिन किसान सुविधाओं के लिए प्रोफ़ाइल चाहिए।",
        continue: "जारी रखें",
        farmerFeature: "यह किसान सुविधा"
    },
    pa: {
        checking: "ਪਹੁੰਚ ਜਾਂਚੀ ਜਾ ਰਹੀ ਹੈ...",
        required: "ਕਿਸਾਨ ਪ੍ਰੋਫ਼ਾਈਲ ਲਾਜ਼ਮੀ ਹੈ",
        preview: "ਤੁਸੀਂ KrishiNayan ਨੂੰ ਮਹਿਮਾਨ ਵਜੋਂ ਵੇਖ ਸਕਦੇ ਹੋ, ਪਰ ਕਿਸਾਨ ਸੁਵਿਧਾਵਾਂ ਲਈ ਪ੍ਰੋਫ਼ਾਈਲ ਚਾਹੀਦੀ ਹੈ।",
        continue: "ਜਾਰੀ ਰੱਖੋ",
        farmerFeature: "ਇਹ ਕਿਸਾਨ ਸੁਵਿਧਾ"
    },
    mr: {
        checking: "प्रवेश तपासत आहे...",
        required: "शेतकरी प्रोफाइल आवश्यक आहे",
        preview: "तुम्ही KrishiNayan अतिथी म्हणून पाहू शकता, पण शेतकरी सुविधा वापरण्यासाठी प्रोफाइल आवश्यक आहे.",
        continue: "पुढे",
        farmerFeature: "ही शेतकरी सुविधा"
    }
};
function AccessBoundary({ children }) {
    _s();
    const { user, isLoading, isGuest } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const t = ACCESS_TEXT[language];
    const farmerOnly = FARMER_ONLY_PREFIXES.some((prefix)=>pathname === prefix || pathname.startsWith(`${prefix}/`));
    const officerOnly = pathname === "/officer" || pathname.startsWith("/officer/");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AccessBoundary.useEffect": ()=>{
            if (isLoading) return;
            if (farmerOnly && !user && !isGuest) setModalOpen(true);
            if (farmerOnly && user?.role === "officer") router.replace("/officer");
            if (officerOnly && user?.role === "farmer") router.replace("/");
            if (officerOnly && !user) router.replace("/login?mode=officer");
        }
    }["AccessBoundary.useEffect"], [
        farmerOnly,
        officerOnly,
        user,
        isGuest,
        isLoading,
        router
    ]);
    if (isLoading && (farmerOnly || officerOnly)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex min-h-screen items-center justify-center bg-forest-deep text-white/75",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    size: 20,
                    className: "mr-2 animate-spin"
                }, void 0, false, {
                    fileName: "[project]/src/components/AccessBoundary.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                " ",
                t.checking
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/AccessBoundary.tsx",
            lineNumber: 82,
            columnNumber: 7
        }, this);
    }
    if (farmerOnly && !user && !isGuest) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex min-h-screen items-center justify-center bg-forest-deep px-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "w-full max-w-[390px] rounded-[28px] bg-cream p-6 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-leaf",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$keyhole$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockKeyhole$3e$__["LockKeyhole"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/src/components/AccessBoundary.tsx",
                                lineNumber: 92,
                                columnNumber: 112
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/AccessBoundary.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "mt-4 text-xl font-bold text-forest",
                            children: t.required
                        }, void 0, false, {
                            fileName: "[project]/src/components/AccessBoundary.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-sm leading-6 text-muted",
                            children: t.preview
                        }, void 0, false, {
                            fileName: "[project]/src/components/AccessBoundary.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setModalOpen(true),
                            className: "mt-5 w-full rounded-2xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep",
                            children: t.continue
                        }, void 0, false, {
                            fileName: "[project]/src/components/AccessBoundary.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/AccessBoundary.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GuestGateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    open: modalOpen,
                    onClose: ()=>{
                        setModalOpen(false);
                        router.replace("/");
                    },
                    feature: t.farmerFeature
                }, void 0, false, {
                    fileName: "[project]/src/components/AccessBoundary.tsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/AccessBoundary.tsx",
            lineNumber: 90,
            columnNumber: 7
        }, this);
    }
    if (farmerOnly && user?.role === "officer" || officerOnly && user?.role !== "officer") {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/AccessBoundary.tsx",
        lineNumber: 106,
        columnNumber: 10
    }, this);
}
_s(AccessBoundary, "B79gGXTVn3EU0EZ+oc3M5hv7O8E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AccessBoundary;
var _c;
__turbopack_context__.k.register(_c, "AccessBoundary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/BrandMark.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrandMark
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function BrandMark({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 512 512",
        role: "img",
        "aria-label": "KrishiNayan",
        className: className,
        xmlns: "http://www.w3.org/2000/svg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                width: "512",
                height: "512",
                rx: "128",
                fill: "#b7e300"
            }, void 0, false, {
                fileName: "[project]/src/components/BrandMark.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M92 256 Q256 132 420 256 Q256 380 92 256 Z",
                fill: "none",
                stroke: "#03271f",
                strokeWidth: "26",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/src/components/BrandMark.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M256 196 C212 233 212 301 256 340 C300 301 300 233 256 196 Z",
                fill: "#03271f"
            }, void 0, false, {
                fileName: "[project]/src/components/BrandMark.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M256 222 V322",
                stroke: "#b7e300",
                strokeWidth: "14",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/src/components/BrandMark.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/BrandMark.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = BrandMark;
var _c;
__turbopack_context__.k.register(_c, "BrandMark");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/DesktopSidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DesktopSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.mjs [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.mjs [app-client] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-pulse.mjs [app-client] (ecmascript) <export default as HeartPulse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.mjs [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/landmark.mjs [app-client] (ecmascript) <export default as Landmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.mjs [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.mjs [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-round.mjs [app-client] (ecmascript) <export default as UserRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BrandMark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BrandMark.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/language-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const SIDEBAR_TEXT = {
    en: {
        tagline: "Farmer-first crop care",
        home: "Home",
        scanCrop: "Scan crop",
        myFarm: "My farm",
        outbreaks: "Outbreaks",
        recovery: "Recovery",
        askExpert: "Ask expert",
        schemes: "Schemes",
        profile: "Profile",
        signedInAs: "Signed in as",
        browsingAs: "Browsing as",
        guestFarmer: "Guest farmer",
        visitor: "Visitor",
        accountNote: "Diagnosis, recovery and nearby alerts stay connected to each field.",
        signOut: "Sign out",
        desktopNavigation: "Desktop navigation"
    },
    hi: {
        tagline: "किसान-प्रथम फसल देखभाल",
        home: "होम",
        scanCrop: "फसल स्कैन",
        myFarm: "मेरा खेत",
        outbreaks: "प्रकोप",
        recovery: "रिकवरी",
        askExpert: "विशेषज्ञ से पूछें",
        schemes: "योजनाएँ",
        profile: "प्रोफ़ाइल",
        signedInAs: "साइन इन",
        browsingAs: "देख रहे हैं",
        guestFarmer: "अतिथि किसान",
        visitor: "आगंतुक",
        accountNote: "निदान, रिकवरी और आस-पास की चेतावनियाँ हर खेत से जुड़ी रहती हैं।",
        signOut: "साइन आउट",
        desktopNavigation: "डेस्कटॉप नेविगेशन"
    },
    pa: {
        tagline: "ਕਿਸਾਨ-ਪਹਿਲਾਂ ਫਸਲ ਸੰਭਾਲ",
        home: "ਹੋਮ",
        scanCrop: "ਫਸਲ ਸਕੈਨ",
        myFarm: "ਮੇਰਾ ਖੇਤ",
        outbreaks: "ਫੈਲਾਅ",
        recovery: "ਰਿਕਵਰੀ",
        askExpert: "ਮਾਹਿਰ ਨੂੰ ਪੁੱਛੋ",
        schemes: "ਯੋਜਨਾਵਾਂ",
        profile: "ਪ੍ਰੋਫ਼ਾਈਲ",
        signedInAs: "ਸਾਈਨ ਇਨ",
        browsingAs: "ਵੇਖ ਰਹੇ ਹੋ",
        guestFarmer: "ਮਹਿਮਾਨ ਕਿਸਾਨ",
        visitor: "ਵਿਜ਼ਟਰ",
        accountNote: "ਜਾਂਚ, ਰਿਕਵਰੀ ਅਤੇ ਨੇੜਲੇ ਅਲਰਟ ਹਰ ਖੇਤ ਨਾਲ ਜੁੜੇ ਰਹਿੰਦੇ ਹਨ।",
        signOut: "ਸਾਈਨ ਆਉਟ",
        desktopNavigation: "ਡੈਸਕਟਾਪ ਨੇਵੀਗੇਸ਼ਨ"
    },
    mr: {
        tagline: "शेतकरी-प्रथम पीक काळजी",
        home: "होम",
        scanCrop: "पीक स्कॅन",
        myFarm: "माझे शेत",
        outbreaks: "प्रादुर्भाव",
        recovery: "पुनर्प्राप्ती",
        askExpert: "तज्ज्ञाला विचारा",
        schemes: "योजना",
        profile: "प्रोफाइल",
        signedInAs: "साइन इन",
        browsingAs: "पाहत आहात",
        guestFarmer: "अतिथी शेतकरी",
        visitor: "पाहुणा",
        accountNote: "निदान, पुनर्प्राप्ती आणि जवळचे इशारे प्रत्येक शेताशी जोडलेले राहतात.",
        signOut: "साइन आउट",
        desktopNavigation: "डेस्कटॉप नेव्हिगेशन"
    }
};
const NAV_ITEMS = [
    {
        href: "/",
        key: "home",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"]
    },
    {
        href: "/scan",
        key: "scanCrop",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"]
    },
    {
        href: "/farm",
        key: "myFarm",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"]
    },
    {
        href: "/alerts",
        key: "outbreaks",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"]
    },
    {
        href: "/recovery",
        key: "recovery",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__["HeartPulse"]
    },
    {
        href: "/chatbot",
        key: "askExpert",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"]
    },
    {
        href: "/policies",
        key: "schemes",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__["Landmark"]
    },
    {
        href: "/profile",
        key: "profile",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"]
    }
];
function DesktopSidebar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, isGuest, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    const t = SIDEBAR_TEXT[language];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-hidden border-r border-white/[0.06] bg-forest-deep px-4 py-6 text-white lg:flex",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-hidden": "true",
                className: "pointer-events-none absolute inset-0 opacity-90",
                style: {
                    background: "radial-gradient(120% 60% at 0% 0%, rgba(183,227,0,0.10), transparent 60%), radial-gradient(80% 50% at 100% 100%, rgba(15,92,63,0.35), transparent 60%)"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/DesktopSidebar.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                className: "relative z-10 flex items-center gap-3 rounded-2xl p-2 no-global-hover",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BrandMark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        className: "h-11 w-11 shrink-0 drop-shadow-[0_4px_18px_rgba(183,227,0,0.25)]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/DesktopSidebar.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block font-display text-lg font-bold tracking-tight",
                                children: "KrishiNayan"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DesktopSidebar.tsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-[11px] font-medium uppercase tracking-[0.14em] text-white/45",
                                children: t.tagline
                            }, void 0, false, {
                                fileName: "[project]/src/components/DesktopSidebar.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DesktopSidebar.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DesktopSidebar.tsx",
                lineNumber: 155,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 my-5 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
            }, void 0, false, {
                fileName: "[project]/src/components/DesktopSidebar.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                "aria-label": t.desktopNavigation,
                className: "relative z-10 flex-1 space-y-1",
                children: NAV_ITEMS.map(({ href, key, icon: Icon })=>{
                    const active = pathname === href;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: href,
                        className: `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${active ? "bg-white/[0.06] text-leaf" : "text-white/60 hover:bg-white/[0.04] hover:text-white"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                className: `absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-full bg-leaf transition-all duration-300 ${active ? "w-[3px] opacity-100" : "w-0 opacity-0"}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/DesktopSidebar.tsx",
                                lineNumber: 188,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                size: 18,
                                strokeWidth: active ? 2.3 : 1.9,
                                className: active ? "text-leaf" : "text-white/50 group-hover:text-white/80"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DesktopSidebar.tsx",
                                lineNumber: 194,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-body tracking-tight",
                                children: t[key]
                            }, void 0, false, {
                                fileName: "[project]/src/components/DesktopSidebar.tsx",
                                lineNumber: 199,
                                columnNumber: 15
                            }, this)
                        ]
                    }, href, true, {
                        fileName: "[project]/src/components/DesktopSidebar.tsx",
                        lineNumber: 179,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/DesktopSidebar.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-eyebrow text-white/35",
                        children: user ? t.signedInAs : t.browsingAs
                    }, void 0, false, {
                        fileName: "[project]/src/components/DesktopSidebar.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1.5 font-display font-bold text-white",
                        children: user ? user.full_name : isGuest ? t.guestFarmer : t.visitor
                    }, void 0, false, {
                        fileName: "[project]/src/components/DesktopSidebar.tsx",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1.5 text-xs leading-5 text-white/50",
                        children: t.accountNote
                    }, void 0, false, {
                        fileName: "[project]/src/components/DesktopSidebar.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this),
                    user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>{
                            logout();
                            router.push("/login");
                        },
                        className: "mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:border-white/25 hover:text-white",
                        children: t.signOut
                    }, void 0, false, {
                        fileName: "[project]/src/components/DesktopSidebar.tsx",
                        lineNumber: 216,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DesktopSidebar.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DesktopSidebar.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
_s(DesktopSidebar, "ETprF6d/RRcvAYDD2NLPeC7XU98=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
_c = DesktopSidebar;
var _c;
__turbopack_context__.k.register(_c, "DesktopSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/GuestGateModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GuestGateModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$keyhole$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockKeyhole$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-keyhole.mjs [app-client] (ecmascript) <export default as LockKeyhole>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/language-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const MODAL_TEXT = {
    en: {
        title: "Create your Farmer Profile",
        before: "Create a farmer profile to use",
        after: "save your activity and receive recommendations based on your crops and farm context.",
        create: "Create Farmer Profile",
        existing: "I already have an account",
        later: "Maybe later",
        close: "Close"
    },
    hi: {
        title: "अपनी किसान प्रोफ़ाइल बनाएँ",
        before: "इस सुविधा का उपयोग करने के लिए किसान प्रोफ़ाइल बनाएँ:",
        after: "अपनी गतिविधि सहेजें और अपनी फसलों व खेत के अनुसार सुझाव प्राप्त करें।",
        create: "किसान प्रोफ़ाइल बनाएँ",
        existing: "मेरा पहले से खाता है",
        later: "बाद में",
        close: "बंद करें"
    },
    pa: {
        title: "ਆਪਣੀ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
        before: "ਇਹ ਸੁਵਿਧਾ ਵਰਤਣ ਲਈ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ:",
        after: "ਆਪਣੀ ਗਤੀਵਿਧੀ ਸੰਭਾਲੋ ਅਤੇ ਆਪਣੀਆਂ ਫਸਲਾਂ ਤੇ ਖੇਤ ਦੇ ਅਨੁਸਾਰ ਸਿਫਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।",
        create: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
        existing: "ਮੇਰਾ ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ",
        later: "ਬਾਅਦ ਵਿੱਚ",
        close: "ਬੰਦ ਕਰੋ"
    },
    mr: {
        title: "तुमचे शेतकरी प्रोफाइल तयार करा",
        before: "ही सुविधा वापरण्यासाठी शेतकरी प्रोफाइल तयार करा:",
        after: "तुमची क्रिया जतन करा आणि तुमच्या पिके व शेतानुसार शिफारसी मिळवा.",
        create: "शेतकरी प्रोफाइल तयार करा",
        existing: "माझ्याकडे आधीच खाते आहे",
        later: "नंतर",
        close: "बंद करा"
    }
};
function GuestGateModal({ open, onClose, feature = "this feature" }) {
    _s();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    const t = MODAL_TEXT[language];
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-4 sm:items-center",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "guest-gate-title",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-[390px] rounded-[28px] bg-cream p-5 shadow-2xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-leaf",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$keyhole$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockKeyhole$3e$__["LockKeyhole"], {
                                size: 22
                            }, void 0, false, {
                                fileName: "[project]/src/components/GuestGateModal.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/GuestGateModal.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-forest/10",
                            "aria-label": t.close,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/src/components/GuestGateModal.tsx",
                                lineNumber: 68,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/GuestGateModal.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GuestGateModal.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    id: "guest-gate-title",
                    className: "mt-4 text-xl font-bold text-forest",
                    children: t.title
                }, void 0, false, {
                    fileName: "[project]/src/components/GuestGateModal.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-2 text-sm leading-6 text-muted",
                    children: [
                        t.before,
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: feature
                        }, void 0, false, {
                            fileName: "[project]/src/components/GuestGateModal.tsx",
                            lineNumber: 73,
                            columnNumber: 22
                        }, this),
                        ", ",
                        t.after
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GuestGateModal.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-5 grid gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/register",
                            className: "rounded-2xl bg-leaf px-4 py-3 text-center text-sm font-bold text-forest-deep",
                            children: t.create
                        }, void 0, false, {
                            fileName: "[project]/src/components/GuestGateModal.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/login?mode=farmer",
                            className: "rounded-2xl border border-forest/15 bg-white px-4 py-3 text-center text-sm font-bold text-forest",
                            children: t.existing
                        }, void 0, false, {
                            fileName: "[project]/src/components/GuestGateModal.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "py-2 text-sm font-semibold text-muted",
                            children: t.later
                        }, void 0, false, {
                            fileName: "[project]/src/components/GuestGateModal.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GuestGateModal.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/GuestGateModal.tsx",
            lineNumber: 62,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/GuestGateModal.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_s(GuestGateModal, "d1ORxvPBup+C3Qetit/BVjvgCJk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
_c = GuestGateModal;
var _c;
__turbopack_context__.k.register(_c, "GuestGateModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/OfflineStatus.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OfflineStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi-off.mjs [app-client] (ecmascript) <export default as WifiOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/language-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const OFFLINE_TEXT = {
    en: {
        title: "Offline mode",
        body: "Saved pages and recent farm data are available. New scans need network."
    },
    hi: {
        title: "ऑफ़लाइन मोड",
        body: "सहेजे गए पेज और हाल का खेत डेटा उपलब्ध है। नए स्कैन के लिए नेटवर्क चाहिए।"
    },
    pa: {
        title: "ਆਫ਼ਲਾਈਨ ਮੋਡ",
        body: "ਸੇਵ ਕੀਤੇ ਪੇਜ ਅਤੇ ਹਾਲੀਆ ਖੇਤ ਡਾਟਾ ਉਪਲਬਧ ਹੈ। ਨਵੇਂ ਸਕੈਨ ਲਈ ਨੈੱਟਵਰਕ ਚਾਹੀਦਾ ਹੈ।"
    },
    mr: {
        title: "ऑफलाइन मोड",
        body: "जतन केलेली पाने आणि अलीकडील शेत डेटा उपलब्ध आहे. नवीन स्कॅनसाठी नेटवर्क आवश्यक आहे."
    }
};
function OfflineStatus() {
    _s();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    const [offline, setOffline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OfflineStatus.useEffect": ()=>{
            const update = {
                "OfflineStatus.useEffect.update": ()=>setOffline(!navigator.onLine)
            }["OfflineStatus.useEffect.update"];
            update();
            window.addEventListener("online", update);
            window.addEventListener("offline", update);
            return ({
                "OfflineStatus.useEffect": ()=>{
                    window.removeEventListener("online", update);
                    window.removeEventListener("offline", update);
                }
            })["OfflineStatus.useEffect"];
        }
    }["OfflineStatus.useEffect"], []);
    if (!offline) return null;
    const t = OFFLINE_TEXT[language];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-x-4 top-4 z-[120] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-leaf/30 bg-forest-deep/95 p-4 text-white shadow-2xl backdrop-blur lg:left-auto lg:right-6 lg:top-6 lg:mx-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf text-forest-deep",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__["WifiOff"], {
                    size: 20
                }, void 0, false, {
                    fileName: "[project]/src/components/OfflineStatus.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/OfflineStatus.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "block text-sm font-bold",
                        children: t.title
                    }, void 0, false, {
                        fileName: "[project]/src/components/OfflineStatus.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "mt-1 block text-xs leading-5 text-white/70",
                        children: t.body
                    }, void 0, false, {
                        fileName: "[project]/src/components/OfflineStatus.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/OfflineStatus.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/OfflineStatus.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s(OfflineStatus, "+CgmtD0hC5ahXRSzfXtZRJNLgs8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$language$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
_c = OfflineStatus;
var _c;
__turbopack_context__.k.register(_c, "OfflineStatus");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/PwaRegister.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PwaRegister
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function PwaRegister() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PwaRegister.useEffect": ()=>{
            const offlineEnabled = ("TURBOPACK compile-time value", "development") === "production" || ("TURBOPACK compile-time value", "true") === "true";
            if ("serviceWorker" in navigator && offlineEnabled) {
                void navigator.serviceWorker.register("/sw.js");
            }
        }
    }["PwaRegister.useEffect"], []);
    return null;
}
_s(PwaRegister, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = PwaRegister;
var _c;
__turbopack_context__.k.register(_c, "PwaRegister");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "AUTH_TOKEN_STORAGE_KEY",
    ()=>AUTH_TOKEN_STORAGE_KEY,
    "ApiError",
    ()=>ApiError,
    "apiFetch",
    ()=>apiFetch,
    "apiJson",
    ()=>apiJson,
    "getStoredToken",
    ()=>getStoredToken,
    "setStoredToken",
    ()=>setStoredToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const CONFIGURED_API_BASE_URL = ("TURBOPACK compile-time value", "http://127.0.0.1:8001")?.trim();
const API_BASE_URL = (CONFIGURED_API_BASE_URL || (("TURBOPACK compile-time truthy", 1) ? "http://127.0.0.1:8000" : "TURBOPACK unreachable")).replace(/\/$/, "");
const AUTH_TOKEN_STORAGE_KEY = "krishiNayanAuthToken";
class ApiError extends Error {
    status;
    constructor(message, status){
        super(message);
        this.status = status;
    }
}
function getStoredToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}
function setStoredToken(token) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (token) {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
}
async function apiFetch(path, options = {}) {
    if (!API_BASE_URL) {
        throw new ApiError("Backend URL is not configured. Set NEXT_PUBLIC_API_BASE_URL for this deployment.", 503);
    }
    const token = getStoredToken();
    const controller = new AbortController();
    const timeout = setTimeout(()=>{
        controller.abort();
    }, 60000);
    const headers = new Headers(options.headers);
    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    try {
        return await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
            signal: options.signal || controller.signal
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError("Backend is taking too long to respond. Please try again.", 408);
        }
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            throw new ApiError("You are offline. Saved data is available only after it has loaded once.", 503);
        }
        throw error;
    } finally{
        clearTimeout(timeout);
    }
}
async function apiJson(path, options = {}) {
    const response = await apiFetch(path, options);
    const data = await response.json().catch(()=>null);
    if (!response.ok) {
        throw new ApiError(extractErrorMessage(data), response.status);
    }
    return data;
}
function extractErrorMessage(data) {
    if (!data || typeof data !== "object" || !("detail" in data)) {
        return "Something went wrong. Please try again.";
    }
    const detail = data.detail;
    if (typeof detail === "string") {
        return detail;
    }
    if (Array.isArray(detail)) {
        return detail.map((item)=>item && typeof item === "object" && "msg" in item ? String(item.msg) : String(item)).join(" ");
    }
    return "Something went wrong. Please try again.";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isGuest, setIsGuest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Invalidates any in-flight /auth/me request when the active session changes.
    // This prevents a stale officer response from restoring the officer session
    // after the user explicitly chooses Guest mode.
    const sessionEpochRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const loadCurrentUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[loadCurrentUser]": async ()=>{
            const requestEpoch = sessionEpochRef.current;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStoredToken"])()) {
                if (requestEpoch === sessionEpochRef.current) {
                    setUser(null);
                    setIsGuest(sessionStorage.getItem("krishinayan-guest-mode") === "true");
                    setIsLoading(false);
                }
                return;
            }
            try {
                const currentUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiJson"])("/auth/me");
                if (requestEpoch === sessionEpochRef.current) {
                    setUser(currentUser);
                }
            } catch (error) {
                if (requestEpoch !== sessionEpochRef.current) return;
                // Expired/invalid token - clear it so we don't keep retrying.
                if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] && error.status === 401) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setStoredToken"])(null);
                }
                setUser(null);
            } finally{
                if (requestEpoch === sessionEpochRef.current) {
                    setIsLoading(false);
                }
            }
        }
    }["AuthProvider.useCallback[loadCurrentUser]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const timer = window.setTimeout({
                "AuthProvider.useEffect.timer": ()=>{
                    loadCurrentUser();
                }
            }["AuthProvider.useEffect.timer"], 0);
            return ({
                "AuthProvider.useEffect": ()=>window.clearTimeout(timer)
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        loadCurrentUser
    ]);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (identifier, password)=>{
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiJson"])("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    identifier,
                    password
                })
            });
            sessionEpochRef.current += 1;
            sessionStorage.removeItem("krishinayan-guest-mode");
            setIsGuest(false);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setStoredToken"])(data.access_token);
            setUser(data.user);
            setIsLoading(false);
            return data.user;
        }
    }["AuthProvider.useCallback[login]"], []);
    const officerLogin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[officerLogin]": async (institutionalId, password)=>{
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiJson"])("/auth/officer-login", {
                method: "POST",
                body: JSON.stringify({
                    institutional_id: institutionalId,
                    password
                })
            });
            sessionEpochRef.current += 1;
            sessionStorage.removeItem("krishinayan-guest-mode");
            setIsGuest(false);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setStoredToken"])(data.access_token);
            setUser(data.user);
            setIsLoading(false);
            return data.user;
        }
    }["AuthProvider.useCallback[officerLogin]"], []);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[register]": async (input)=>{
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiJson"])("/auth/register", {
                method: "POST",
                body: JSON.stringify(input)
            });
            sessionEpochRef.current += 1;
            sessionStorage.removeItem("krishinayan-guest-mode");
            setIsGuest(false);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setStoredToken"])(data.access_token);
            setUser(data.user);
            setIsLoading(false);
        }
    }["AuthProvider.useCallback[register]"], []);
    const clearClientSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[clearClientSession]": ()=>{
            sessionEpochRef.current += 1;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setStoredToken"])(null);
            sessionStorage.removeItem("krishinayan-guest-mode");
            setIsGuest(false);
            setUser(null);
            setIsLoading(false);
        }
    }["AuthProvider.useCallback[clearClientSession]"], []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": ()=>{
            // JWT auth is stateless in this prototype. Clearing the browser token is
            // the authoritative sign-out; calling /auth/logout after clearing it would
            // only produce a 401 because there is no token left to send.
            clearClientSession();
        }
    }["AuthProvider.useCallback[logout]"], [
        clearClientSession
    ]);
    const continueAsGuest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[continueAsGuest]": ()=>{
            sessionEpochRef.current += 1;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setStoredToken"])(null);
            sessionStorage.setItem("krishinayan-guest-mode", "true");
            setUser(null);
            setIsGuest(true);
            setIsLoading(false);
        }
    }["AuthProvider.useCallback[continueAsGuest]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            isGuest,
            login,
            officerLogin,
            register,
            logout,
            continueAsGuest,
            refreshUser: loadCurrentUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/auth-context.tsx",
        lineNumber: 229,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "1ctFpiVCIZB+tDWHTvzdmYLHyFg=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/language-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function LanguageProvider({ children }) {
    _s();
    const [language, setLanguageState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("en");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageProvider.useEffect": ()=>{
            const savedLanguage = localStorage.getItem("krishinayan-language");
            if (savedLanguage === "en" || savedLanguage === "hi" || savedLanguage === "pa" || savedLanguage === "mr") {
                setLanguageState(savedLanguage);
            }
        }
    }["LanguageProvider.useEffect"], []);
    const setLanguage = (newLanguage)=>{
        setLanguageState(newLanguage);
        localStorage.setItem("krishinayan-language", newLanguage);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            language,
            setLanguage
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/language-context.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(LanguageProvider, "FXB+iOn5qvnQ+Z2TniTnEa5i+p0=");
_c = LanguageProvider;
function useLanguage() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
_s1(useLanguage, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "LanguageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0zqugno._.js.map