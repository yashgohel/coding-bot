import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Bot | AI Coding Assistant",
  description: "Your personal AI coding assistant to help you debug and write code faster.",
  openGraph: {
    title: "Code Bot | AI Coding Assistant",
    description: "Your personal AI coding assistant to help you debug and write code faster.",
    url: "https://your-website-url.com",
    siteName: "Code Bot",
    images: [
      {
        url: "/og-image.png", // This will look for og-image.png in the public folder
        width: 1200,
        height: 630,
        alt: "Code Bot Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Bot | AI Coding Assistant",
    description: "Your personal AI coding assistant to help you debug and write code faster.",
    images: ["/twitter-image.png"], // Looks for twitter-image.png in the public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
