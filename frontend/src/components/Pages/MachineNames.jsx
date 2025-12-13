import React, { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { toast } from "sonner";
import { Button } from "../ui/button";
import TanstackTable from "../ReusableComponents/TanstackTable";
import { machinesColumns } from "../Constants/Columns";
import { MachineDialog } from "../ReusableComponents/EditDialog";

const Machines = () => {
  const [machinesList, setMachinesList] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedMachine, setSelectedMachine] = useState(null);

  const handleCreate = () => {
    setMode("create");
    setSelectedMachine(null);
    setOpen(true);
  };

  const handleEdit = (machine) => {
    setMode("edit");
    setSelectedMachine(machine);
    setOpen(true);
  };

  const fetchAllMachines = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/machines`,
        { withCredentials: true }
      );
      setMachinesList(res?.data?.machines);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch Machines"
      );
    }
  };

  const createMachine = async (machineName) => {
    try {
      const res = await api.post(
        "/machines/createMachine",
        { machineName },
        { withCredentials: true }
      );
      console.log(res?.data?.machine);
      setMachinesList((prev) => [...prev, res?.data?.machine]);
      toast.success(res?.data?.message || "Machine created successfully!");
      
    } catch (err) {
      console.log(err?.response?.data?.errors?.machineName);
      toast.error(
        err?.response?.data?.message || err?.response?.data?.errors?.machineName || err?.response?.statusText || "Machine could not be created"
      );
    }
  };

  const updateMachine = async (id, machineName) => {
    try {
      const res = await api.put(
        `machines/updateMachine/${id}`,
        { machineName },
        { withCredentials: true }
      );

      setMachinesList((prev) =>
        prev.map((s) => (s._id === id ? res.data.machine : s))
      );

      toast.success("Machine updated successfully!");
    } catch (err) {
        console.log(err?.response?.data?.errors?.machineName);
        toast.error(
          err?.response?.data?.message || err?.response?.data?.errors?.machineName || err?.response?.statusText || "Machine could not be created"
        );
    }
  };

  const deleteMachine = async(id)=>{
    try {
      const res = await api.delete(
        `machines/deleteMachine/${id}`,
        { withCredentials: true }
      );
      setMachinesList((prev) => prev.filter((s) => s._id !== id));

      toast.success(res?.data?.message || "Machine Deleted successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Machine could not be updated"
      );
    }
  }

  useEffect(() => {
    fetchAllMachines();
  }, []);

  return (
    <div className="p-6 w-full bg-background flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Machines Management
          </h1>
          <Button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
            onClick={handleCreate}
          >
            + Create New Machine
          </Button>
        </div>

        <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border p-3">
          <TanstackTable data={machinesList} columns={machinesColumns(handleEdit,deleteMachine)} />

          <MachineDialog
            open={open}
            onClose={setOpen}
            mode={mode}
            machine={selectedMachine}
            action={mode === "create" ? createMachine : updateMachine}
          />
        </div>
      </div>
    </div>
  );
};

export default Machines;
