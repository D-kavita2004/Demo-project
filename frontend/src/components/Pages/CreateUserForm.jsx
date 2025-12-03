import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema } from "../ValidateSchema/authInputValidationShema";
import axios from "axios";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateUserForm = ({closeDialog}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = async (data) => {
    try {

      const res = await axios.post(`${apiUrl}/auth/register`, data, {
        withCredentials: true,
      });
        toast.success(res?.data?.message || "User created successfully");
        reset();
        closeDialog?.();

    } catch (err) {
       toast.error(err?.response?.data?.message || err?.response?.statusText || "Oops! User Cannot be Created");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="
        bg-white/70 dark:bg-neutral-900/60 
        backdrop-blur-xl 
        p-8 rounded-2xl border shadow-lg 
        max-w-2xl mx-auto 
        space-y-8 
        transition-all
      "
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create New User
        </h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to add a new user to the system.
        </p>
      </div>

      <div className="border-t" />

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Username */}
        <div className="space-y-2">
          <Label>Username</Label>
          <Input
            {...register("username")}
             required
            placeholder="Enter username"
            className="transition-all focus:ring-2 focus:ring-primary"
          />
          {errors.username && (
            <p className="text-red-500 text-xs">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            {...register("email")}
             required
            placeholder="user@example.com"
            className="transition-all focus:ring-2 focus:ring-primary"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input
           required
            {...register("firstName")}
            placeholder="Enter first name"
            className="transition-all focus:ring-2 focus:ring-primary"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input
            {...register("lastName")}
             required
            placeholder="Enter last name"
            className="transition-all focus:ring-2 focus:ring-primary"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs">{errors.lastName.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            required
            {...register("password")}
            placeholder="Enter password"
            className="transition-all focus:ring-2 focus:ring-primary"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Team */}
        <div className="space-y-2">
          <Label>Team</Label>
          <Select onValueChange={(v) => setValue("team", v)} required>
            <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary">
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
            <p className="text-red-500 text-xs">{errors.team.message}</p>
          )}
        </div>
      </div>

      <div className="border-t" />

      {/* Submit Button */}
      <Button
        type="submit"
        className="
          w-full py-3 text-base rounded-xl 
          font-medium
          shadow-md hover:shadow-lg 
          transition-all
        "
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
};

export default CreateUserForm;
