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

export const metadata: Metadata = {
  title: "สุ่มมันส์ | จับฉลาก คุยอะไรดี Truth or Dare",
  description: "เว็บแอพจับฉลาก สุ่มท็อปปิคคุย และ Truth or Dare เล่นพร้อมกันหลายคนในห้องเดียว",
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
      </head>
      <body className="relative min-h-full w-full bg-white dark:bg-neutral-900">
        <div className="relative mx-auto flex min-h-screen w-full flex-col">{children}</div>
      </body>
    </html>
  );
}
