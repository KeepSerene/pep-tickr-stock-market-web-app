import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "./ui/button";
import { Loader2, StarIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import useDebounce from "@/hooks/useDebounce";

export function SearchCommandMenu({
  renderAs = "btn",
  label = "Add Stock",
  initialStocks,
}: SearchCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = Boolean(searchTerm.trim());
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  // Toggle command dialog with Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setIsLoading(true);

    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch (error) {
      console.error("Error in SearchCommandMenu:", error);

      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setIsOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  return (
    <>
      {renderAs === "text" ? (
        <span onClick={() => setIsOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="search-button"
        >
          {label}
        </Button>
      )}

      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        className="search-dialog"
      >
        <div className="search-field">
          <CommandInput
            placeholder="Search stocks..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="search-input"
          />

          {isLoading && <Loader2 className="search-loader" />}
        </div>

        <CommandList className="search-list">
          {isLoading ? (
            <CommandEmpty className="search-list-empty">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks && displayStocks.length === 0 ? (
            <p className="search-list-indicator">
              {isSearchMode ? "No results found" : "No stocks available"}
            </p>
          ) : (
            <ul>
              <li className="search-count">
                <span>
                  {isSearchMode ? "Search Results" : "Popular Stocks"}
                </span>
                &nbsp;<span>({displayStocks.length || 0})</span>
              </li>

              {displayStocks.map((stockItem) => (
                <li key={stockItem.symbol} className="search-item">
                  <Link
                    href={`/stocks/${stockItem.symbol}`}
                    onClick={handleSelectStock}
                    className="search-item-link"
                  >
                    <TrendingUpIcon className="size-4 text-gray-500" />

                    <span className="flex-1 flex flex-col">
                      <span className="search-item-name">{stockItem.name}</span>

                      <span className="text-gray-500 text-sm">
                        {stockItem.symbol} | {stockItem.exchange} |{" "}
                        {stockItem.type}
                      </span>
                    </span>

                    <StarIcon className="size-4 text-gray-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
