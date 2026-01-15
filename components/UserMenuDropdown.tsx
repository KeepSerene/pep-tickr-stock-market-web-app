"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOutIcon } from "lucide-react";
import NavItems from "./NavItems";

function UserMenuDropdown() {
  const router = useRouter();

  const handleSignOut = async () => {
    router.push("/sign-in");
  };

  const user = { name: "John Doe", email: "example@email.com" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" asChild>
        <Button
          type="button"
          variant="ghost"
          className="gap-3 text-gray-400 transition-colors hover:text-yellow-500 focus-visible:text-yellow-500"
        >
          <Avatar className="size-8">
            <AvatarImage src="https://github.com/shadcn.png" />

            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
              {user.name.at(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <span className="hidden md:flex flex-col items-start">
            <span
              title={user.name || "User"}
              className="max-w-[15ch] text-gray-400 text-base font-medium truncate"
            >
              {user.name || "User"}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="text-gray-400">
        <DropdownMenuLabel className="py-2 flex items-center gap-3 relative">
          <Avatar className="size-10">
            <AvatarImage src="https://github.com/shadcn.png" />

            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
              {user.name.at(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start">
            <p
              title={user.name || "User"}
              className="max-w-[20ch] text-gray-400 font-medium truncate"
            >
              {user.name || "User"}
            </p>

            <p
              title={user.email || ""}
              className="max-w-[20ch] text-gray-500 text-sm truncate"
            >
              {user.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-600" />

        <DropdownMenuItem
          role="button"
          onClick={handleSignOut}
          className="text-gray-100 font-medium transition-colors focus:bg-transparent focus:text-yellow-500"
        >
          <LogOutIcon className="max-sm:hidden size-4 transition-colors focus:bg-transparent focus:text-yellow-500" />
          <span>Sign Out</span>
        </DropdownMenuItem>

        <nav className="sm:hidden">
          <NavItems />
        </nav>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenuDropdown;
