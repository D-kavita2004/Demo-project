import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const EditUserDialog = ({ open, onClose, userData, onUpdate }) => {
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
              value={watch("team")} // controlled value
              onValueChange={(value) =>
                setValue("team", value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="team">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="QA">QA</SelectItem>
                <SelectItem value="Part">Part</SelectItem>
                <SelectItem value="Fit">Fit</SelectItem>
                <SelectItem value="Assembly">Assembly</SelectItem>
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

export default EditUserDialog;
