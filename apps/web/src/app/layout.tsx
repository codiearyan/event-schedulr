import type { Metadata } from "next";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventSchedulr",
  description: "Event management made simple",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ConvexClientProvider>
          {children}
          <Toaster richColors />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
