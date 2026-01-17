import AuthenticatedHeader from "@/components/authenticated-header";

export default function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<AuthenticatedHeader />
			{children}
		</div>
	);
}
