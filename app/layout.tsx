import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "goodagain. — Good things find new homes",
  description: "Thoughtful finds, kind people, and the joy of passing something on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
