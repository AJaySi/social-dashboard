'use client';

import { Inter } from "next/font/google";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Providers from "./components/Providers";
import Header from "./components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname.startsWith('/auth/');
  const isLoading = status === 'loading';

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session && !isAuthPage) {
    router.push('/auth/signin');
    return null;
  }

  if (session && isAuthPage) {
    router.push('/');
    return null;
  }

  return children;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          <AuthWrapper>
            <Header />
            {children}
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
