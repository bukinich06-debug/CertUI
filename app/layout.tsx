import { AppHeader } from "@/components/layout/appHeader";
import { PageTracker } from "@/components/layout/pageTracker";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <div className="min-h-screen bg-background text-foreground">
          <AppHeader
            hasSession={Boolean(session)}
            userName={session?.user.name ?? session?.user.email ?? undefined}
          />
          <PageTracker />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
