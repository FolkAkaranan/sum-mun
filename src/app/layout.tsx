import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "สุ่มมันส์ | จับฉลาก คุยอะไรดี Truth or Dare",
  description: "เว็บแอพจับฉลาก สุ่มท็อปปิคคุย และ Truth or Dare เล่นพร้อมกันหลายคนในห้องเดียว",
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: [
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: `${basePath}/icon-192.png`,
  },
};

export const viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("sum-mun-theme");var dark=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(dark)document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === "production"
                ? `if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("${basePath}/sw.js",{scope:"${basePath}/"}).catch(function(){});});}`
                : `if("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});});if(window.caches){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k);});});}}`,
          }}
        />
      </head>
      <body className="relative min-h-full w-full bg-white dark:bg-neutral-900">
        <div className="relative mx-auto flex min-h-screen w-full flex-col">{children}</div>
      </body>
    </html>
  );
}
