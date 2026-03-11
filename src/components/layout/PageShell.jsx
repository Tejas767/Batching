/**
 * PageShell.jsx — Layout component.
 *
 * CDD Layer 2: Main responsive container for all pages.
 * Provides consistent padding and background styling.
 */
"use client";

export function PageShell({ children }) {
  return (
    <main className="min-h-screen bg-[#FDFCF7] scroll-smooth pb-28 md:pb-20">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 md:px-10 md:pt-10">
        {children}
      </div>
    </main>
  );
}
