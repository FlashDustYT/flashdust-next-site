import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "FlashDust | Official Creator Hub",
  description: "Official FlashDust creator hub for YouTube, Twitch, stream VODs, and business inquiries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
