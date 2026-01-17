// import { api } from "@event-schedulr/backend/convex/_generated/api";
// import { useQuery } from "convex/react";

// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuGroup,
// 	DropdownMenuItem,
// 	DropdownMenuLabel,
// 	DropdownMenuSeparator,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { authClient } from "@/lib/auth-client";

// import { Button } from "./ui/button";

// export default function UserMenu() {
// 	const user = useQuery(api.auth.getCurrentUser);

// 	return (
// 		<DropdownMenu>
// 			<DropdownMenuTrigger render={<Button variant="outline" />}>
// 				{user?.name}
// 			</DropdownMenuTrigger>
// 			<DropdownMenuContent className="bg-card">
// 				<DropdownMenuGroup>
// 					<DropdownMenuLabel>My Account</DropdownMenuLabel>
// 					<DropdownMenuSeparator />
// 					<DropdownMenuItem>{user?.email}</DropdownMenuItem>
// 					<DropdownMenuItem
// 						variant="destructive"
// 						onClick={() => {
// 							authClient.signOut({
// 								fetchOptions: {
// 									onSuccess: () => {
// 										location.reload();
// 									},
// 								},
// 							});
// 						}}
// 					>
// 						Sign Out
// 					</DropdownMenuItem>
// 				</DropdownMenuGroup>
// 			</DropdownMenuContent>
// 		</DropdownMenu>
// 	);
// }

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";

export default function UserMenu() {
  const user = useQuery(api.auth.getCurrentUser);

  if (!user) return null;

  return (
    <DropdownMenu>
      {/* Trigger */}
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full px-3 py-6 cursor-pointer hover:bg-white/10 transition-colors"
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
            {user.name?.[0]?.toUpperCase()}
          </div>

          {/* Name */}
          <span className="hidden sm:block text-sm font-medium text-white/90">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>

      {/* Menu */}
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl border border-white/10 bg-[#0b0f1a]/95 backdrop-blur-xl shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-white/50">
            My Account
          </DropdownMenuLabel>

          {/* User info */}
          <div className="px-2 py-2">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Profile */}
          <Link to="/profile">
            <DropdownMenuItem className="gap-2 text-white/80 focus:bg-white/10 focus:text-white cursor-pointer">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Sign out */}
          <DropdownMenuItem
            className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    location.reload();
                  },
                },
              });
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
