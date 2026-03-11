import { Sora, Spline_Sans_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ─── SEO Metadata ─────────────────────────────
   Placed here so every page inherits it.
   Individual pages can override via their own
   export const metadata = { ... }.
──────────────────────────────────────────────── */
export const metadata = {
  title: {
    default: "ShreeHari | Concrete Batching System",
    template: "%s | ShreeHari CBS",
  },
  description:
    "A professional concrete batching management system for tracking batch entries, mix designs, autographic reports, and production history.",
  keywords: [
    "concrete batching",
    "batching plant",
    "mix design",
    "autographic record",
    "production console",
    "ready mix concrete",
  ],
  authors: [{ name: "ShreeHari" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ShreeHari | Concrete Batching System",
    description: "Professional concrete batching management — entry, mix design, report.",
    type: "website",
    locale: "en_IN",
  },
};

// Viewport and themeColor must be separate exports in Next.js 15+
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f3d3e",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${splineMono.variable} antialiased`}
      >
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
