import posthog from "posthog-js"

const useProxy = process.env.NEXT_PUBLIC_POSTHOG_USE_PROXY === "true"

const apiHost =
  useProxy && process.env.NODE_ENV !== "test"
    ? "/ingest"
    : process.env.NEXT_PUBLIC_POSTHOG_API_HOST && process.env.NEXT_PUBLIC_POSTHOG_API_HOST.trim().length > 0
      ? process.env.NEXT_PUBLIC_POSTHOG_API_HOST
      : "https://eu.i.posthog.com"

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: apiHost,
  ui_host: "https://eu.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking
  debug: process.env.NODE_ENV === "development",
});
