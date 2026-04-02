import type { Metadata } from "next";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "GardenMind",
  description: "Plan, plot and manage your garden with AI-powered advice.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
