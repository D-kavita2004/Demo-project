import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// FULL JSX VERSION COLUMNS
export const usersColumns = [
  {
    accessorKey: "username",
    header: () => <div className="font-semibold">Username</div>,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("username")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="font-semibold">Email</div>,
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-300">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "firstName",
    header: () => <div className="font-semibold">First Name</div>,
    cell: ({ row }) => <span>{row.getValue("firstName")}</span>,
  },
  {
    accessorKey: "lastName",
    header: () => <div className="font-semibold">Last Name</div>,
    cell: ({ row }) => <span>{row.getValue("lastName")}</span>,
  },
  {
    accessorKey: "team",
    header: () => <div className="font-semibold">Team</div>,
    cell: ({ row }) => {
      const team = row.getValue("team");

      const teamColors = {
        QA: "bg-purple-100 text-purple-700",
        Part: "bg-blue-100 text-blue-700",
        Fit: "bg-green-100 text-green-700",
        Assembly: "bg-orange-100 text-orange-700",
      };

      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            teamColors[team] || "bg-gray-200 text-gray-700"
          }`}
        >
          {team}
        </span>
      );
    },
  },
    {
    accessorKey: "firstName",
    header: () => <div className="font-semibold">First Name</div>,
    cell: ({ row }) => <span>{row.getValue("firstName")}</span>,
  },
  {
    accessorKey: "role",
    header: () => <div className="font-semibold">Role</div>,
    cell: ({ row }) => <span>{row.getValue("role")}</span>,
  },
  // ⭐ Actions Column
  {
    id: "actions",
    header: () => <div className="font-semibold text-right">Actions</div>,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => alert("Edit " + user.username)}>
                Edit User
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => alert("Delete " + user.username)}
                className="text-red-600 focus:text-red-600"
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
