import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — generated from the FixPedia mark.
export default function AppleIcon() {
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
          fontSize: 118,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        F
      </div>
    ),
    { ...size }
  );
}
