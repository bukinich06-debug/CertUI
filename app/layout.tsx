import { AppHeader } from "@/components/layout/appHeader";
import { getSessionUser } from "@/lib/auth/session";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Сертификаты",
};

interface IProps {
  children: React.ReactNode;
}

const RootLayout = async ({ children }: Readonly<IProps>) => {
  const sessionUser = await getSessionUser();

  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <div className="min-h-screen bg-background text-foreground">
          <AppHeader
            hasSession={Boolean(sessionUser)}
            userName={sessionUser?.name ?? sessionUser?.email ?? undefined}
          />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
