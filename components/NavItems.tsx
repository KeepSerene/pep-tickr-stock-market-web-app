"use client";

import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchCommandMenu } from "./SearchCommandMenu";

function NavItems({
  initialStocks,
}: {
  initialStocks: StockWithWatchlistStatus[];
}) {
  const pathname = usePathname();

  const checkIsActive = (href: string) => href === pathname;

  return (
    <ul className="max-sm:text-sm font-medium p-2 flex flex-col sm:flex-row gap-3 sm:gap-10">
      {NAV_ITEMS.map(({ label, href }) => {
        if (label === "Search") {
          return (
            <li
              key="search-trigger"
              title="Cmd/Ctrl + K"
              aria-label="Press Cmd/Ctrl + K to toggle"
            >
              <SearchCommandMenu
                renderAs="text"
                label="Search"
                initialStocks={initialStocks}
              />
            </li>
          );
        }

        return (
          <li key={label}>
            <Link
              href={href}
              className={cn(
                "transition-colors hover:text-yellow-500 focus-visible:text-yellow-500",
                checkIsActive(href) ? "text-gray-100" : "",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default NavItems;
