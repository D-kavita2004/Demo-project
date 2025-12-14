import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const usersColumns = (toggleUserStatus,openEditDialog) => [
  {
    accessorKey: "username",
    header: () => <div className="font-semibold">Username</div>,
    cell: ({ row }) => <span className="font-medium">{row.getValue("username")}</span>,
  },
  {
    accessorKey: "email",
    header: () => <div className="font-semibold">Email</div>,
    cell: ({ row }) => <span className="text-gray-600 dark:text-gray-300">{row.getValue("email")}</span>,
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
      const team = row.getValue("team")?.supplierName || "N/A";
      const teamColors = "bg-purple-600 text-purple-700";
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${teamColors[team] || "bg-gray-200 text-gray-700"}`}>
          {team}
        </span>
      );
    },
  },
  {
    accessorKey: "enabled",
    header: () => <div className="font-semibold">Status</div>,
    cell: ({ row }) => {
      const isEnabled = row.getValue("enabled");
      return (
        <div className={`flex items-center gap-2 px-2 py-1 w-fit rounded-md text-xs font-semibold ${isEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {isEnabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {isEnabled ? "Enabled" : "Disabled"}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="font-semibold">Role</div>,
    cell: ({ row }) => <span>{row.getValue("role")}</span>,
  },
  {
    id: "actions",
    header: () => <div className="font-semibold text-right">Actions</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex justify-end">
          {
            row.getValue("role") != "admin" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog?.(user)}>
                Edit User
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => toggleUserStatus(user.username, user.enabled)}
              >
                {user.enabled ? "Disable" : "Enable"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            )
          }
        </div>
      );
    },
  },
];

export const suppliersColumns = (handleEdit,deleteSupplier) => [
  {
    accessorKey: "serialNumber",
    header: () => <div className="font-semibold">S.No.</div>,
    cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
  },
  {
    accessorKey: "supplierName",
    header: () => <div className="font-semibold">Supplier Name</div>,
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-300">
        {row.getValue("supplierName")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="font-semibold text-center w-full">Actions</div>,
    cell: ({ row }) => {
      const supplier = row.original;

       return (
          <div className="flex justify-center w-full">

            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted mx-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                  <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                    Edit
                  </DropdownMenuItem>

                  {/* This item acts as the trigger */}
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>

                </DropdownMenuContent>
              </DropdownMenu>

              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the supplier.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteSupplier(row.original._id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
  );
    },
  },
];

export const partsColumns = (handleEdit,deletePart) => [
  {
    accessorKey: "serialNumber",
    header: () => <div className="font-semibold">S.No.</div>,
    cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
  },
  {
    accessorKey: "partName",
    header: () => <div className="font-semibold">Part Name</div>,
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-300">
        {row.getValue("partName")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="font-semibold text-center w-full">Actions</div>,
    cell: ({ row }) => {
      const part = row.original;

       return (
          <div className="flex justify-center w-full">

            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted mx-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                  <DropdownMenuItem onClick={() => handleEdit(part)}>
                    Edit
                  </DropdownMenuItem>

                  {/* This item acts as the trigger */}
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>

                </DropdownMenuContent>
              </DropdownMenu>

              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the part.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deletePart(row.original._id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
  );
    },
  },
];

export const machinesColumns = (handleEdit,deleteMachine) => [
  {
    accessorKey: "serialNumber",
    header: () => <div className="font-semibold">S.No.</div>,
    cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
  },
  {
    accessorKey: "machineName",
    header: () => <div className="font-semibold">Machine Name</div>,
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-300">
        {row.getValue("machineName")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="font-semibold text-center w-full">Actions</div>,
    cell: ({ row }) => {
      const machine = row.original;

       return (
          <div className="flex justify-center w-full">

            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted mx-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                  <DropdownMenuItem onClick={() => handleEdit(machine)}>
                    Edit
                  </DropdownMenuItem>

                  {/* This item acts as the trigger */}
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>

                </DropdownMenuContent>
              </DropdownMenu>

              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the machine.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMachine(row.original._id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
  );
    },
  },
];

export const processesColumns = (handleEdit,deleteProcess) => [
  {
    accessorKey: "serialNumber",
    header: () => <div className="font-semibold">S.No.</div>,
    cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
  },
  {
    accessorKey: "processName",
    header: () => <div className="font-semibold">Process Name</div>,
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-300">
        {row.getValue("processName")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="font-semibold text-center w-full">Actions</div>,
    cell: ({ row }) => {
      const process = row.original;

       return (
          <div className="flex justify-center w-full">

            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted mx-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                  <DropdownMenuItem onClick={() => handleEdit(process)}>
                    Edit
                  </DropdownMenuItem>

                  {/* This item acts as the trigger */}
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>

                </DropdownMenuContent>
              </DropdownMenu>

              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the process.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteProcess(row.original._id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
  );
    },
  },
];
