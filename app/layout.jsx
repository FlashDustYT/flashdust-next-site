import "./globals.css";

export const metadata = {
  title: "FlashDust | Official Creator Hub",
  description: "Official FlashDust creator hub for YouTube, Twitch, stream VODs, and business inquiries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
