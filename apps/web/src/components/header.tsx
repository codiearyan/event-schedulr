// import { Link } from "@tanstack/react-router";

import { Link } from "@tanstack/react-router";

export default function Header() {
  const navLinks = [
    {
      label: "EventSchedulr",
      href: "/",
      position: "left",
    },
    {
      label: "Features",
      href: "/features",
      position: "center",
    },
    {
      label: "Solutions",
      href: "/solutions",

      position: "center",
    },
    {
      label: "Case Studies",
      href: "/case-studies",
      position: "center",
    },
    {
      label: "Pricing",
      href: "/pricing",
      position: "center",
    },

    {
      label: "Login",
      href: "/login",
      position: "right",
      renderAs: "button",
    },
  ];

  const leftNav = navLinks.filter((l) => l.position === "left");
  const centerNav = navLinks.filter((l) => l.position === "center");
  const rightNav = navLinks.filter((l) => l.position === "right");

  return (
    <header className="flex items-center bg-[#0C0C0C] p-3 justify-between ">
      <div>
        {leftNav.map(({ label, href }) => (
          <Link key={label} to={href} className="p-3 text-white">
            {label}
          </Link>
        ))}
      </div>
      <nav className="flex font-bold gap-5">
        {centerNav.map(({ label, href }) => (
          <Link
            className=" hover:text-primary-dark text-white active:scale-95 p-2"
            key={label}
            to={href}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div>
        {rightNav.map(
          ({ label, href, renderAs }) =>
            renderAs === "button" && (
              <Link to={href}>
                <button
                  className="bg-primary transition-all ease-in-out hover:bg-primary-dark hover:text-white  cursor-pointer font-semibold active:scale-95 px-6 rounded-md py-2"
                  key={label}
                >
                  {label}
                </button>
              </Link>
            )
        )}
      </div>
    </header>
  );
}
