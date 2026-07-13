import type { NextConfig } from "next";

// basePath ต้องตรงกับชื่อ repo เวลา deploy ไปที่ username.github.io/<repo-name>
// ตั้งผ่าน env NEXT_PUBLIC_BASE_PATH ใน GitHub Actions workflow (ดู .github/workflows/deploy.yml)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
