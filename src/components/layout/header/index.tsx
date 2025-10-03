import Link from "next/link";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="text-primary hover:text-primary/90">
              <Logo />
            </Link>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
