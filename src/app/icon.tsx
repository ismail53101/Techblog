import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon — generated from the FixPedia mark (no binary asset needed).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "#fff",
          fontSize: 44,
          fontWeight: 800,
          fontFamily: "sans-serif",
          borderRadius: 14,
        }}
      >
        F
      </div>
    ),
    { ...size }
  );
}
