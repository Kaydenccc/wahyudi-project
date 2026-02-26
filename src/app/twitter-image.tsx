import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "PB. TIGA BERLIAN - Sistem Pembinaan Atlet Bulutangkis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1a0f 0%, #0d2818 40%, #14532d 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            opacity: 0.06,
            background:
              "radial-gradient(circle at 20% 50%, #22c55e 0%, transparent 50%), radial-gradient(circle at 80% 50%, #4ade80 0%, transparent 50%)",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #22c55e, #4ade80, #22c55e)",
          }}
        />

        {/* Shuttlecock icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            borderRadius: "24px",
            background: "rgba(34, 197, 94, 0.15)",
            border: "2px solid rgba(34, 197, 94, 0.3)",
            marginBottom: "24px",
            fontSize: "48px",
          }}
        >
          🏸
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <h1
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-1px",
              margin: 0,
              lineHeight: 1,
            }}
          >
            PB. TIGA BERLIAN
          </h1>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#4ade80",
              letterSpacing: "6px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Badminton
          </p>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "24px",
            color: "rgba(255, 255, 255, 0.7)",
            marginTop: "32px",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Sistem Informasi Pembinaan & Monitoring Performa Atlet Bulutangkis
        </p>

        {/* Bottom domain */}
        <p
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.35)",
            fontWeight: 500,
          }}
        >
          sitigaberlian.my.id
        </p>
      </div>
    ),
    { ...size }
  );
}
