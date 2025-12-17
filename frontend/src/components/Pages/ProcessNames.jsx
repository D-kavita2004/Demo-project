import React, { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { toast } from "sonner";
import { Button } from "../ui/button";
import TanstackTable from "../ReusableComponents/TanstackTable";
import { processesColumns } from "../Utils/Columns";
import { ProcessDialog } from "../ReusableComponents/EditDialog";

const Processes = () => {
  const [processsList, setProcesssList] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedProcess, setSelectedProcess] = useState(null);

  const handleCreate = () => {
    setMode("create");
    setSelectedProcess(null);
    setOpen(true);
  };

  const handleEdit = (process) => {
    setMode("edit");
    setSelectedProcess(process);
    setOpen(true);
  };

  const fetchAllProcesses = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/processes`,
        { withCredentials: true }
      );
      setProcesssList(res?.data?.processs);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch Processs"
      );
    }
  };

  const createProcess = async (processName) => {
    try {
      const res = await api.post(
        "/processes/createProcess",
        { processName },
        { withCredentials: true }
      );
      console.log(res?.data?.process);
      setProcesssList((prev) => [...prev, res?.data?.process]);
      toast.success(res?.data?.message || "Process created successfully!");
      
    } catch (err) {
      console.log(err?.response?.data?.errors?.processName);
      toast.error(
        err?.response?.data?.message || err?.response?.data?.errors?.processName || err?.response?.statusText || "Process could not be created"
      );
    }
  };

  const updateProcess = async (id, processName) => {
    try {
      const res = await api.put(
        `processes/updateProcess/${id}`,
        { processName },
        { withCredentials: true }
      );

      setProcesssList((prev) =>
        prev.map((s) => (s.processCode === id ? res.data.process : s))
      );

      toast.success("Process updated successfully!");
    } catch (err) {
        console.log(err?.response?.data?.errors?.processName);
        toast.error(
          err?.response?.data?.message || err?.response?.data?.errors?.processName || err?.response?.statusText || "Process could not be created"
        );
    }
  };

  const deleteProcess = async(id)=>{
    try {
      const res = await api.delete(
        `processes/deleteProcess/${id}`,
        { withCredentials: true }
      );
      setProcesssList((prev) => prev.filter((s) => s.processCode !== id));

      toast.success(res?.data?.message || "Process Deleted successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Process could not be updated"
      );
    }
  }

  useEffect(() => {
    fetchAllProcesses();
  }, []);

  return (
    <div className="p-6 w-full bg-background flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Processs Management
          </h1>
          <Button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
            onClick={handleCreate}
          >
            + Create New Process
          </Button>
        </div>

        <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border p-3">
          <TanstackTable data={processsList} columns={processesColumns(handleEdit,deleteProcess)} />

          <ProcessDialog
            open={open}
            onClose={setOpen}
            mode={mode}
            process={selectedProcess}
            action={mode === "create" ? createProcess : updateProcess}
          />
        </div>
      </div>
    </div>
  );
};

export default Processes;
