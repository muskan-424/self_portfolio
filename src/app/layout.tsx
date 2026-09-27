import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { profile, socials } from "@/data/profile";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const description =
  "Muskan Mittal: final-year B.Tech CSE (Full Stack AI) student at UPES and Full-Stack & GenAI engineer. Internships at Xebia and Teal Feed. Projects in MERN, FastAPI, RAG and Gemini, plus an AI assistant you can ask about her.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${profile.name} · ${profile.title}`,
  description,
  keywords: ["Muskan Mittal", "Full Stack Developer", "MERN", "GenAI", "RAG", "UPES", "portfolio", "Software Engineer"],
  authors: [{ name: profile.name, url: socials[0].href }],
  openGraph: {
    type: "profile",
    title: `${profile.name} · ${profile.title}`,
    description,
    images: [{ url: profile.photoUrl, width: 800, height: 800, alt: profile.name }],
  },
  twitter: { card: "summary", title: `${profile.name} · ${profile.title}`, description, images: [profile.photoUrl] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
  ],
};

// Runs before paint: applies the saved/system theme so there is no flash of the wrong theme.
const bootScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  image: profile.photoUrl,
  email: `mailto:${profile.email}`,
  alumniOf: "University of Petroleum and Energy Studies (UPES)",
  sameAs: socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
  knowsAbout: ["React", "Node.js", "Express", "MongoDB", "FastAPI", "RAG", "LangChain", "Gemini"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
