import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Your Day, Track Every Task",
  description:
    "DayTask is a free daily task manager with Day, Week, and Month calendar views. Plan your day, track progress, and roll unfinished tasks over to tomorrow — beautifully and in real time.",
  openGraph: {
    type: "website",
    title: "Plan Your Day, Track Every Task",
    description:
      "Plan your day, track every task, and stay productive with intuitive calendar views.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Your Day, Track Every Task",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}