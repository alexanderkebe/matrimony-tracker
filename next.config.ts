import type { NextConfig } from "next";

// The Wedding Planning API is still Python. On Vercel it runs as the
// api/weddings.py function; locally app/api/v1/[...path] proxies to server.py.
const planningRewrites = process.env.NODE_ENV === "production" && !process.env.PLANNING_API_URL
  ? [
      { source: "/api/v1/weddings", destination: "/api/weddings?wpPath=weddings" },
      { source: "/api/v1/weddings/:path*", destination: "/api/weddings?wpPath=weddings/:path*" },
      { source: "/api/v1/service-templates", destination: "/api/weddings?wpPath=service-templates" },
      { source: "/api/v1/service-templates/:path*", destination: "/api/weddings?wpPath=service-templates/:path*" }
    ]
  : [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The app and its tests are opened at 127.0.0.1; without this the dev server
  // blocks its own hot-reload socket and the page reloads mid-session.
  allowedDevOrigins: ["127.0.0.1"],
  // The floating dev badge covers the app's bottom-left controls on phone widths.
  devIndicators: false,
  async rewrites() {
    return {
      beforeFiles: planningRewrites,
      // The planning workspace is a client-side view of the same page.
      afterFiles: [
        { source: "/weddings", destination: "/" },
        // The client portal is the same page in a reduced, couple-facing mode.
        { source: "/portal", destination: "/" },
        { source: "/weddings/:path*", destination: "/" }
      ],
      fallback: []
    };
  },
  async headers() {
    // Legacy scripts are versioned by query string; never serve stale controls.
    return ["/app.js", "/pickers.js", "/weddings.js", "/styles.css", "/weddings.css"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "no-store" }]
    }));
  }
};

export default nextConfig;
