import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fazil's Portofolio & Production",
  description: "Welcome to Fazil's Portofolio & Production, where creativity meets innovation. Explore a curated collection of projects, showcasing expertise in design, development, and production. From captivating visuals to cutting-edge solutions, discover the essence of Fazil's work and passion for delivering exceptional results. Join us on this journey of creativity and excellence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
