import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Capture quick ephemeral notes in DayTask and convert any of them into scheduled tasks with one click.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}