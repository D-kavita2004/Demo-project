import React, { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { toast } from "sonner";
import { Button } from "../ui/button";
import TanstackTable from "../ReusableComponents/TanstackTable";
import { suppliersColumns } from "../Constants/Columns";
import { SupplierDialog } from "../ReusableComponents/EditDialog";

const Suppliers = () => {
  const [suppliersList, setSuppliersList] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleCreate = () => {
    setMode("create");
    setSelectedSupplier(null);
    setOpen(true);
  };

  const handleEdit = (supplier) => {
    setMode("edit");
    setSelectedSupplier(supplier);
    setOpen(true);
  };

  const fetchAllSuppliers = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`,
        { withCredentials: true }
      );
      setSuppliersList(res?.data?.suppliers);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch Suppliers"
      );
    }
  };

  const createSupplier = async (supplierName) => {
    try {
      const res = await api.post(
        "/suppliers/createSupplier",
        { supplierName },
        { withCredentials: true }
      );
      console.log(res?.data?.supplier);
      setSuppliersList((prev) => [...prev, res?.data?.supplier]);
      toast.success(res?.data?.message || "Supplier created successfully!");
      
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Supplier could not be created"
      );
    }
  };

  const updateSupplier = async (id, supplierName) => {
    try {
      const res = await api.put(
        `suppliers/updateSupplier/${id}`,
        { supplierName },
        { withCredentials: true }
      );

      setSuppliersList((prev) =>
        prev.map((s) => (s._id === id ? res.data.supplier : s))
      );

      toast.success("Supplier updated successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Supplier could not be updated"
      );
    }
  };
  
  const deleteSupplier = async(id)=>{
    try {
      const res = await api.delete(
        `suppliers/deleteSupplier/${id}`,
        { withCredentials: true }
      );
      setSuppliersList((prev) => prev.filter((s) => s._id !== id));

      toast.success("Supplier updated successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Supplier could not be updated"
      );
    }
  }

  useEffect(() => {
    fetchAllSuppliers();
  }, []);

  return (
    <div className="p-6 w-full bg-background flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Suppliers Management
          </h1>
          <Button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
            onClick={handleCreate}
          >
            + Create New Supplier
          </Button>
        </div>

        <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border p-3">
          <TanstackTable data={suppliersList} columns={suppliersColumns(handleEdit,deleteSupplier)} />

          <SupplierDialog
            open={open}
            onClose={setOpen}
            mode={mode}
            supplier={selectedSupplier}
            action={mode === "create" ? createSupplier : updateSupplier}
          />
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
