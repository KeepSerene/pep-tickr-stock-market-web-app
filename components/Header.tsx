import Link from "next/link";
import Logo from "./Logo";
import NavItems from "./NavItems";
import UserMenuDropdown from "./UserMenuDropdown";

function Header() {
  return (
    <header className="header sticky top-0">
      <div className="container header-wrapper">
        <Link href="/">
          <Logo className="w-auto h-8" />
        </Link>

        <nav className="hidden sm:block">
          <NavItems />
        </nav>

        <UserMenuDropdown />
      </div>
    </header>
  );
}

export default Header;
