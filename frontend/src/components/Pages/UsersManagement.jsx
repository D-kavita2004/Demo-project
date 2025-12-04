import { Input } from "@/components/ui/input";
import CreateUserForm from "./CreateUserForm";
import { SearchIcon, CheckCircleIcon, XCircleIcon, Users } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const UsersManagement = () => {
  const [usersList,setUsersList] = useState([]);

  const fetchAllUsers = async()=>{
    try{
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/allUsers`,{withCredentials:true});
      console.log(res?.data?.data);
      setUsersList(res?.data?.data);
      toast.success(res?.data?.message);
    }
    catch(err){
      console.log(err);
      toast.error(err?.response?.data?.message || err?.response?.statusText || "Users could be fetched");
    }
  };

  useEffect(()=>{
    fetchAllUsers();
  },[])

  return (
    <div className="p-4 md:p-6 lg:p-2 space-y-6 max-w-full h-fullflex flex-col">
      
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

          <CreateUserForm/>
        </div>


      </div>

    </div>
  );
};

export default UsersManagement;
