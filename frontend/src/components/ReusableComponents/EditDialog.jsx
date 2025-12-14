import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserSchema } from "../ValidateSchema/authInputValidationShema";
import { machineSchema, supplierSchema, partSchema, processSchema } from "../ValidateSchema/entityValidationSchema";
import {  } from "../ValidateSchema/entityValidationSchema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const EditUserDialog = ({ open, onClose, userData, onUpdate,suppliersList }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      team: "",
    },
    resolver:zodResolver(editUserSchema)
  });

// preload data when dialog opens
useEffect(() => {
  if (userData) {
    reset({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      team: userData.team || "",
    });
  }
}, [userData, reset]);

// RESET FORM WHEN DIALOG CLOSES
useEffect(() => {
  if (!open) {
    reset();
  }
}, [open, reset]);


  const onSubmit = async (data) => {
    await onUpdate(userData.username, data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* First Name */}
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Hidden input to register team */}
          <input
            type="hidden"
            {...register("team")}
          />

          {/* Team Dropdown */}
          <div className="space-y-1">
            <Label htmlFor="team">Team</Label>

            <Select
              value={watch("team")}
              onValueChange={(value) => setValue("team", value, { shouldValidate: true })}
            >
              <SelectTrigger id="team">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>

              <SelectContent>
                {suppliersList.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    {supplier.supplierName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            {errors.team && (
              <p className="text-red-500 text-sm">{errors.team.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end pt-3">
            <Button type="submit" className="px-6">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const SupplierDialog = ({ open, onClose, mode, supplier, action }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver:zodResolver(supplierSchema),
    defaultValues: { supplierName: "" },
  });

  // Pre-fill value if editing
  useEffect(() => {
    if (mode === "edit" && supplier) {
      setValue("supplierName", supplier.supplierName);
    } else {
      reset();
    }
  }, [mode, supplier]);

  const onSubmit = (data) => {
    if (mode === "create") {
      console.log(data);
      action(data.supplierName);
    } else {
      action(supplier._id, data.supplierName);
    }

    reset();
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Supplier" : "Edit Supplier"}
          </DialogTitle>
        </DialogHeader>

        {/* FORM must be inside DialogContent */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              {...register("supplierName")}
              placeholder="Enter supplier name"
            />
            {errors.supplierName && (
              <p className="text-red-500 text-sm">
                {errors.supplierName.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const PartDialog = ({ open, onClose, mode, part, action }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver:zodResolver(partSchema),
    defaultValues: { partName: "" },
  });

  // Pre-fill value if editing
  useEffect(() => {
    if (mode === "edit" && part) {
      setValue("partName", part.partName);
    } else {
      reset();
    }
  }, [mode, part]);

  const onSubmit = (data) => {
    if (mode === "create") {
      console.log(data);
      action(data.partName);
    } else {
      action(part._id, data.partName);
    }

    reset();
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Part" : "Edit Part"}
          </DialogTitle>
        </DialogHeader>

        {/* FORM must be inside DialogContent */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="partName">Part Name</Label>
            <Input
              id="partName"
              {...register("partName")}
              placeholder="Enter Part name"
            />
            {errors.partName && (
              <p className="text-red-500 text-sm">
                {errors?.partName?.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const MachineDialog = ({ open, onClose, mode, machine, action }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver:zodResolver(machineSchema),
    defaultValues: { machineName: "" },
  });

  // Pre-fill value if editing
  useEffect(() => {
    if (mode === "edit" && machine) {
      setValue("machineName", machine.machineName);
    } else {
      reset();
    }
  }, [mode, machine]);

  const onSubmit = (data) => {
    if (mode === "create") {
      console.log(data);
      action(data.machineName);
    } else {
      action(machine._id, data.machineName);
    }

    reset();
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Machine" : "Edit Machine"}
          </DialogTitle>
        </DialogHeader>

        {/* FORM must be inside DialogContent */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="machineName">Machine Name</Label>
            <Input
              id="machineName"
              {...register("machineName")}
              placeholder="Enter Machine name"
            />
            {errors.machineName && (
              <p className="text-red-500 text-sm">
                {errors?.machineName?.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const ProcessDialog = ({ open, onClose, mode, process, action }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver:zodResolver(processSchema),
    defaultValues: { processName: "" },
  });

  // Pre-fill value if editing
  useEffect(() => {
    if (mode === "edit" && process) {
      setValue("processName", process.processName);
    } else {
      reset();
    }
  }, [mode, process]);

  const onSubmit = (data) => {
    if (mode === "create") {
      console.log(data);
      action(data.processName);
    } else {
      action(process._id, data.processName);
    }

    reset();
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Process" : "Edit Process"}
          </DialogTitle>
        </DialogHeader>

        {/* FORM must be inside DialogContent */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="processName">Process Name</Label>
            <Input
              id="processName"
              {...register("processName")}
              placeholder="Enter Process name"
            />
            {errors.processName && (
              <p className="text-red-500 text-sm">
                {errors?.processName?.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
