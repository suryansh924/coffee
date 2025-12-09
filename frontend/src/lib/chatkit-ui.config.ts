import type { StartScreenPrompt, ThemeOption } from "@openai/chatkit";

// ============================================================
// ENVIRONMENT CONFIG
// ============================================================

export const CHATKIT_WORKFLOW_ID =
    import.meta.env.VITE_CHATKIT_WORKFLOW_ID?.trim() ?? "";

export const CHATKIT_SESSION_ENDPOINT =
    import.meta.env.VITE_CHATKIT_SESSION_ENDPOINT?.trim() ??
    "/api/chatkit/session";

// ============================================================
// UX COPY
// ============================================================

export const CHATKIT_GREETING =
    "Hey, I’m Ella — your Coffee concierge. I’ll help you build your profile and find people you might vibe with.";

export const CHATKIT_PLACEHOLDER =
    "Tell Ella anything to get started…";

export const DEFAULT_MATCHES_HEADLINE =
    "People Ella thinks you'll vibe with";

// ============================================================
// START SCREEN PROMPTS
// ============================================================

export const CHATKIT_STARTER_PROMPTS: StartScreenPrompt[] = [
    {
        label: "Build my profile",
        prompt: "Can you help me build my Coffee profile?",
        icon: "profile",
    },
    {
        label: "Find local matches",
        prompt: "Who would you recommend I meet nearby?",
        icon: "sparkle",
    },
    {
        label: "Tune my preferences",
        prompt: "Can we refine what I'm looking for?",
        icon: "profile",
    },
    {
        label: "What can you do?",
        prompt: "What can you help me with inside Coffee?",
        icon: "circle-question",
    },
];

// ============================================================
// THEME CONFIGURATION (Coffee purple theme)
// ============================================================

export const COFFEE_PURPLE = "#8B5CF6"; // Tailwind purple-500-ish

export const getChatKitTheme = (
    scheme: "light" | "dark" = "light"
): ThemeOption => ({
    colorScheme: scheme,
    radius: "round",
    color: {
        accent: {
            primary: COFFEE_PURPLE,
            level: 2,
        },
        grayscale: {
            hue: 220,
            tint: scheme === "dark" ? 6 : 4,
            shade: scheme === "dark" ? -2 : -4,
        },
    },
});

// ============================================================
// TYPES FOR MATCH WIDGETS
// ============================================================

export type ChatKitMatch = {
    match_user_id: string;
    name?: string;
    age?: number;
    city?: string;
    tagline?: string;
    score?: number;
    overlap_interests?: string[];
};

export type ProfileProgressState = {
    percentage: number;
    label?: string;
};

// ============================================================
// BASE CHATKIT UI CONFIG (to spread into useChatKit)
// ============================================================

export const createBaseChatKitUIConfig = () => ({
    theme: getChatKitTheme("light"),
    startScreen: {
        greeting: CHATKIT_GREETING,
        prompts: CHATKIT_STARTER_PROMPTS,
    },
    composer: {
        placeholder: CHATKIT_PLACEHOLDER,
        attachments: { enabled: true },
    },
    header: {
        title: {
            enabled: true,
            text: "Ella — Coffee",
        },
    },
});
