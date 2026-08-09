import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
      >
        📚
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  );
}
