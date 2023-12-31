import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/assets/scss/globals.scss";
import Providers from "./providers";
import LogoutButton from "@/components/LogoutButton";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zoho Demo",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-auto">
      <body
        className={`${inter.className} overflow-auto flex min-h-screen min-w-screen justify-center flex-col items-center gap-[20px]`}
      >
        <Providers>
          {children}

          <LogoutButton />
        </Providers>
        <Script src="https://js.zohocdn.com/officeplatform/v1/js/common/xdc-1.0.min.js"></Script>
      </body>
    </html>
  );
}
