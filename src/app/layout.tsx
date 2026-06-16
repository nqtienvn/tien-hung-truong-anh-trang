import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MuseumProvider } from "@/context/MuseumContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bảo Tàng Ảo 3D | Hệ Thống Triển Lãm Không Gian Nghệ Thuật Tương Tác",
  description: "Trải nghiệm không gian bảo tàng ảo 3D tương tác thời gian thực, xem tranh nghệ thuật và các mô hình điêu khắc cổ vật với chất lượng cao trên nền tảng Web.",
  keywords: ["bao tang ao 3d", "virtual museum", "trien lam nghe thuat 3d", "react three fiber", "nextjs"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0a0a0d] text-slate-100 font-sans flex flex-col">
        <MuseumProvider>
          {children}
        </MuseumProvider>
      </body>
    </html>
  );
}
