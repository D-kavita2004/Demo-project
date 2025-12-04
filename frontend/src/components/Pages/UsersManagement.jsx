import { Input } from "@/components/ui/input";
import CreateUserForm from "./CreateUserForm";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TanstackTable from "../ReusableComponents/TanstackTable";
import { usersColumns } from "../Constants/usersColumns";

const UsersManagement = () => {
  const [usersList, setUsersList] = useState([]);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user/allUsers`,
        { withCredentials: true }
      );

      setUsersList(res?.data?.data);
      toast.success(res?.data?.message);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Something went wrong while fetching users"
      );
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="p-2 md:p-6 lg:p-10 w-full min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        
        {/* === Header Row === */}
        <div className="
          w-full flex flex-col sm:flex-row 
          justify-between items-center 
          gap-4
        ">
          {/* Heading */}
          <h1 className="
            text-3xl md:text-4xl font-bold 
            text-gray-900 dark:text-gray-100
            text-center sm:text-left
          ">
            Users Management
          </h1>

          {/* Create Button */}
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <CreateUserForm />
          </div>
        </div>

        {/* === Main Card === */}
        <div className="
          w-full bg-white dark:bg-neutral-900 
          rounded-2xl shadow-xl 
          border border-gray-200 dark:border-neutral-800
        ">
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-3">
            <TanstackTable data={usersList} columns={usersColumns} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default UsersManagement;
