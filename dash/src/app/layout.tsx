import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alouette — Dashboard Mairie",
  description: "Dashboard d'administration pour la mairie",
  icons: { icon: "/plume.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
