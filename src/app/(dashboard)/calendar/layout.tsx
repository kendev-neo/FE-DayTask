import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "Plan your tasks across Day, Week, and Month calendar views. Drag to reorder, mark progress, and roll unfinished tasks over to the next day.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}