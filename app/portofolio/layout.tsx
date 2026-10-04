import type { Metadata } from "next";
const SITE_URL = "https://dhiyaa-fazila.my.id";
const PAGE_PATH = "/portofolio";
const OG_IMAGE = "/portofolio/og-image.jpg";

const TITLE = "Dhiyaa Fazila Nugraha | Fullstack Developer & Collaborative Robotic Operator";
const DESCRIPTION =
  "Portfolio of Dhiyaa Fazila Nugraha, a vocational student at SMK Negeri 1 Jakarta majoring in Information Systems, Networking, and Applications (SIJA). Fullstack developer, collaborative robotic operator, and cloud engineer with award winning work in UI/UX design, IoT, cloud computing, and scientific research.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Dhiyaa Fazila Nugraha",
  },
  description: DESCRIPTION,
  applicationName: "Dhiyaa Fazila Nugraha Portfolio",
  authors: [{ name: "Dhiyaa Fazila Nugraha", url: `${SITE_URL}${PAGE_PATH}` }],
  creator: "Dhiyaa Fazila Nugraha",
  publisher: "Dhiyaa Fazila Nugraha",
  keywords: [
    "Dhiyaa Fazila Nugraha",
    "Fazil",
    "fzlngh",
    "fullstack developer",
    "cloud engineer",
    "collaborative robotic operator",
    "UI UX designer Indonesia",
    "SMK Negeri 1 Jakarta",
    "SIJA",
    "IoT developer Jakarta",
    "AWS cloud computing student",
    "portfolio developer Indonesia",
  ],
  category: "technology",
  alternates: {
    canonical: PAGE_PATH,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "profile",
    firstName: "Dhiyaa Fazila",
    lastName: "Nugraha",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Dhiyaa Fazila Nugraha Portfolio",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Dhiyaa Fazila Nugraha, fullstack developer and cloud engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/portofolio/favicon.ico",
    shortcut: "/portofolio/favicon.ico",
    apple: "/portofolio/icon.png",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dhiyaa Fazila Nugraha",
  alternateName: "Fazil",
  url: `${SITE_URL}${PAGE_PATH}`,
  image: `${SITE_URL}${OG_IMAGE}`,
  jobTitle: "Fullstack Developer & Cloud Engineer",
  description: DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Depok",
    addressRegion: "Jawa Barat",
    addressCountry: "ID",
  },
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "SMK Negeri 1 Jakarta",
  },
  knowsAbout: [
    "Fullstack Development",
    "Cloud Computing",
    "Amazon Web Services",
    "Collaborative Robotics",
    "Internet of Things",
    "UI/UX Design",
  ],
  knowsLanguage: ["id", "en", "ja"],
  sameAs: ["https://github.com/fzlngh", "https://www.instagram.com/pajilowkey"],
  email: "mailto:nugrahafazila@gmail.com",
};

export default function PortofolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {children}
    </>
  );
}