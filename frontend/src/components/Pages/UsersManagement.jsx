import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "sonner";
import TanstackTable from "../ReusableComponents/TanstackTable";
import CreateUserForm from "./CreateUserForm";
import { UserContext } from "../Constants/userContext";
import { usersColumns } from "../Constants/usersColumns";
import EditUserDialog from "../ReusableComponents/EditUserDialog";

const UsersManagement = () => {
  const [usersList, setUsersList] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const updateUser = async (username, updatedData) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/update/${username}`,
        updatedData,
        { withCredentials: true }
      );

    } catch (err) {
      console.log("Update user error:", err);
    }
  };
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/allUsers`, { withCredentials: true });
      setUsersList(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not fetch users");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Toggle user status and update context
  const toggleUserStatus = async (username, currentStatus) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/user/changeStatus`,
        { username },
        { withCredentials: true }
      );
      const status = res?.data?.newStatus;
      toast.success(res?.data?.message);

      // Correctly update usersList
      setUsersList(prev =>
        prev.map(u => 
          u.username === username ? { ...u, enabled: status } : u
        )
      );

    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.statusText || "Could not change status");
    }
  };


  return (
    <div className="p-6 w-full min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center sm:text-left">
            Users Management
          </h1>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <CreateUserForm />
          </div>
        </div>

        {/* Table */}
        <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-x-auto p-3">
          <TanstackTable data={usersList} columns={usersColumns(toggleUserStatus, openEditDialog)} />
          <EditUserDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        userData={selectedUser}
        onUpdate={updateUser}
      />
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
