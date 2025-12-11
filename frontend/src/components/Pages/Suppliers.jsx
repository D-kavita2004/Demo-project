import React, { useEffect, useState, useContext } from "react";
import api from "@/api/axiosInstance";
import { toast } from "sonner";
import { Button } from "../ui/button";
import TanstackTable from "../ReusableComponents/TanstackTable";
import CreateUserForm from "./CreateUserForm";
import { UserContext } from "../Constants/userContext";
// import { usersColumns } from "../Constants/Columns";
import { suppliersColumns } from "../Constants/Columns";
import { SupplierDialog } from "../ReusableComponents/EditDialog";

const Suppliers = () => {
   const [suppliersList, setSuppliersList] = useState([]);
   const [open, setOpen] = useState(false);
   const [mode, setMode] = useState("create"); // "create" | "edit"
   const [selectedSupplier, setSelectedSupplier] = useState(null);

 
  // For create
  const handleCreate = () => {
    setMode("create");
    setSelectedSupplier(null);
    setOpen(true);
  };

  // For edit
  const handleEdit = (supplier) => {
    setMode("edit");
    setSelectedSupplier(supplier);
    setOpen(true);
  };
 
   const fetchAllSuppliers = async () => {
     try {
       const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/suppliers`, { withCredentials: true });
       setSuppliersList(res.data.data);
     } catch (err) {
        toast.error(err?.response?.data?.message || err?.response?.statusText || "Could not fetch Suppliers");
     }
   };
   
   const createSupplier = async()=>{
    try{
      const res = await api.post("/createSupplier",{withCredentials:true});
    }
    catch(err){
       toast.error(err?.response?.data?.message || err?.response?.statusText || "Oops! Supplier Cannot be Created");
    }
   }
 
   useEffect(() => {
     fetchAllSuppliers();
   }, []);
  
   return (
     <div className="p-6 w-full bg-background flex justify-center">
       <div className="w-full max-w-7xl flex flex-col gap-6">
         {/* Header */}
         <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center sm:text-left">
             Suppliers Management
           </h1>
           <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <Button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 w-full sm:w-auto" onClick={handleCreate}>
                + Create New Supplier
            </Button>
           </div>
         </div>
 
         {/* Table */}
         <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-x-auto p-3">
            <TanstackTable data={suppliersList} columns={suppliersColumns(handleEdit)} />
            <SupplierDialog
              open={open}
              onClose={() => setOpen(false)}
              mode={mode}  // create / edit
              supplier={selectedSupplier}
            />
         </div>
       </div>
     </div>
   );
}

export default Suppliers