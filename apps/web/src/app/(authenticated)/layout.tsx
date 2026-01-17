import AuthenticatedHeader from "@/components/authenticated-header";

export default function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="eve h-screen">
			<AuthenticatedHeader />
			{children}
		</div>
	);
}
