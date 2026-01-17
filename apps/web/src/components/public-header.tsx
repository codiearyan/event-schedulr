import Link from "next/link";

export default function PublicHeader() {
  const centerNav = [
    { label: "Features", href: "/features" },
    { label: "Solutions", href: "/solutions" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-linear-to-b from-[#0b0f1a] via-[#0a0d14] to-[#06080f]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.15),transparent_40%)]" />
      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="https://cdn.discordapp.com/attachments/843057977023004692/1461325669769150736/WhatsApp_Image_2026-01-15_at_16.47.20-removebg-preview_1_-_Edited_1.png?ex=696a2515&is=6968d395&hm=7069116d20d5579ab03b1b6893cf39b95a3d8bb5e0ef470545755aabf7d79462&"
              alt="EventSchedulr"
              className="h-10 w-auto relative z-10"
            />
            <span className="absolute -inset-2 rounded-xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-white font-semibold tracking-wide">
            EventSchedulr
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {centerNav.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="relative text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/auth"
          className="relative inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white
          bg-linear-to-br from-primary to-indigo-600
          shadow-lg shadow-primary/20
          hover:shadow-indigo-500/10
          hover:-translate-y-0.5
          active:translate-y-0
          transition-all"
        >
          Sign In
          <span className="absolute -inset-px rounded-xl bg-indigo-500/40 blur-lg opacity-0 hover:opacity-100 transition-opacity" />
        </Link>
      </div>
    </header>
  );
}
