import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/constants";

export const runtime = "edge";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || siteConfig.name).slice(0, 140);
  const category = (searchParams.get("category") || "").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0b1020 0%, #1e1b4b 55%, #4f46e5 130%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{siteConfig.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {category ? (
            <div
              style={{
                fontSize: 24,
                color: "#c7d2fe",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {category}
            </div>
          ) : null}
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>
            {title}
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#a5b4fc" }}>{siteConfig.url.replace(/^https?:\/\//, "")}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
