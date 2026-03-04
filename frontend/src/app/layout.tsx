import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hirevize - Automated Job Applications",
  description: "Tailor resumes and automate job applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-page text-navy-800 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
