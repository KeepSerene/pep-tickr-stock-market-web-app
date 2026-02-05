import Link from "next/link";
import Logo from "./Logo";
import NavItems from "./NavItems";
import UserMenuDropdown from "./UserMenuDropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";

async function Header({ user }: { user: User }) {
  const initialStocks = await searchStocks();

  return (
    <header className="header sticky top-0">
      <div className="container header-wrapper">
        <Link href="/">
          <Logo className="w-auto h-8" />
        </Link>

        <nav className="hidden sm:block">
          <NavItems initialStocks={initialStocks} />
        </nav>

        <UserMenuDropdown user={user} initialStocks={initialStocks} />
      </div>
    </header>
  );
}

export default Header;
