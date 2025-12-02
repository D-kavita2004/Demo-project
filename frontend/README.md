import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
  { id: 2, name: "Kavita Sharma", email: "kavita@example.com", status: "Inactive" },
  { id: 3, name: "Amit Verma", email: "amit@example.com", status: "Active" },
];

const UsersManagement = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full h-full bg-amber-100 flex flex-col">
      
      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mx-auto">
        Users Management
      </h1> 

      {/* Page Card */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6 w-full">

        {/* Search + Create */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-1/2">
            <Input
              placeholder="Search users..."
              className="rounded-lg border-gray-300 dark:border-gray-700 pl-10 shadow-sm focus:ring-2 focus:ring-blue-500 w-full"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 w-full sm:w-auto">
                + Create New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              {/* Form can go here */}
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <div className="max-w-full  mt-6 bg-amber-700">
          <Table className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}
                    >
                      {user.status === "Active" ? (
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 mr-1" />
                      )}
                      {user.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
};

export default UsersManagement;
