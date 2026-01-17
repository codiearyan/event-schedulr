import AuthenticatedHeader from "@/components/authenticated-header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen eve">
      <AuthenticatedHeader />
      {children}
    </div>
  );
}