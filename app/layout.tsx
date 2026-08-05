import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bear Ranks | Powered by ChatBRP",
  description: "Submit three things. The Bear decides the order.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
