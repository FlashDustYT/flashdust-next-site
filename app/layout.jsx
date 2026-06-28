import "./globals.css";

export const metadata = {
  title: "FlashDust | Official Creator Hub",
  description: "Official FlashDust creator site for YouTube, Twitch, stream VODs, creator websites, and business inquiries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
