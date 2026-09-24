import { ImageResponse } from "next/og";

export const alt = "DayTask — Daily Task Management";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const GRADIENT =
  "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 45%, #06b6d4 100%)";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "72px",
          background: GRADIENT,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "140px",
            height: "140px",
            borderRadius: "32px",
            background: "rgba(255,255,255,0.12)",
            border: "6px solid rgba(255,255,255,0.55)",
          }}
        >
          <svg
            width="88"
            height="88"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            <path d="m9 16 2 2 4-4" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            width: "780px",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: "72px", fontWeight: 800, margin: 0 }}>
            DayTask
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 500,
              marginTop: "28px",
              opacity: 0.86,
            }}
          >
            Plan your day. Track every task.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}