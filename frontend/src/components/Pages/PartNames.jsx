import React, { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { toast } from "sonner";
import { Button } from "../ui/button";
import TanstackTable from "../ReusableComponents/TanstackTable";
import { partsColumns } from "../Utils/Columns";
import { PartDialog } from "../ReusableComponents/EditDialog";

const Parts = () => {
  const [partsList, setpartsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedpart, setSelectedpart] = useState(null);

  const handleCreate = () => {
    setMode("create");
    setSelectedpart(null);
    setOpen(true);
  };

  const handleEdit = (part) => {
    setMode("edit");
    setSelectedpart(part);
    setOpen(true);
  };

  const fetchAllParts = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/parts`,
        { withCredentials: true }
      );
      setpartsList(res?.data?.parts);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch parts"
      );
    }
  };

  const createPart = async (partName) => {
    try {
      const res = await api.post(
        "/parts/createPart",
        { partName },
        { withCredentials: true }
      );
      console.log(res?.data?.part);
      setpartsList((prev) => [...prev, res?.data?.part]);
      toast.success(res?.data?.message || "Part created successfully!");
      
    } catch (err) {
      console.log(err?.response?.data?.errors?.partName);
      toast.error(
        err?.response?.data?.message || err?.response?.data?.errors?.partName || err?.response?.statusText || "Part could not be created"
      );
    }
  };

  const updatePart = async (id, partName) => {
    try {
      const res = await api.put(
        `parts/updatePart/${id}`,
        { partName },
        { withCredentials: true }
      );

      setpartsList((prev) =>
        prev.map((s) => (s.partCode === id ? res.data.part : s))
      );

      toast.success("part updated successfully!");
    } catch (err) {
        console.log(err?.response?.data?.errors?.partName);
        toast.error(
          err?.response?.data?.message || err?.response?.data?.errors?.partName || err?.response?.statusText || "part could not be created"
        );
    }
  };

  const deletePart = async(id)=>{
    try {
      const res = await api.delete(
        `parts/deletePart/${id}`,
        { withCredentials: true }
      );
      setpartsList((prev) => prev.filter((s) => s.partCode !== id));

      toast.success(res?.data?.message || "part Deleted successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "part could not be updated"
      );
    }
  }

  useEffect(() => {
    fetchAllParts();
  }, []);

  return (
    <div className="p-6 w-full bg-background flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Parts Management
          </h1>
          <Button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
            onClick={handleCreate}
          >
            + Create New Part
          </Button>
        </div>

        <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border p-3">
          <TanstackTable data={partsList} columns={partsColumns(handleEdit,deletePart)} />

          <PartDialog
            open={open}
            onClose={setOpen}
            mode={mode}
            part={selectedpart}
            action={mode === "create" ? createPart : updatePart}
          />
        </div>
      </div>
    </div>
  );
};

export default Parts;
