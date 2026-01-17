import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/providers/convex-provider";
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
		<html lang="en">
			<body>
				<ConvexClientProvider>
					{children}
					<Toaster richColors />
				</ConvexClientProvider>
			</body>
		</html>
	);
}
