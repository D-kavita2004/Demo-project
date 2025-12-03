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
  SelectValue
} from "@/components/ui/select";

const CreateUserForm = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(registerUserSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${apiUrl}/register`, data, { withCredentials: true });

      if (res.data.success) {
        toast.success("User created successfully");
        reset();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">

      {/* Username */}
      <div className="my-4">
        <Label htmlFor="username" className="mb-1" >Username</Label>
        <Input id="username" {...register("username")} placeholder="Enter username" />
        {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
      </div>

      {/* Email */}
      <div className="my-4">
        <Label htmlFor="email" className="mb-1">Email</Label>
        <Input id="email" {...register("email")} placeholder="Enter email" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>

      {/* First Name */}
      <div className="my-4">
        <Label htmlFor="firstName" className="mb-1">First Name</Label>
        <Input id="firstName" {...register("firstName")} placeholder="Enter first name" />
        {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
      </div>

      {/* Last Name */}
      <div className="my-4">
        <Label htmlFor="lastName" className="mb-1">Last Name</Label>
        <Input id="lastName" {...register("lastName")} placeholder="Enter last name" />
        {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
      </div>

      {/* Password */}
      <div className="my-4">
        <Label htmlFor="password" className="mb-1">Password</Label>
        <Input type="password" id="password" {...register("password")} placeholder="Enter password" />
        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
      </div>

      {/* Team */}
      <div className="my-4">
        <Label htmlFor="team" className="mb-1">Team</Label>
        <Select onValueChange={(v) => setValue("team", v)}>
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
        {errors.team && <p className="text-red-500 text-xs">{errors.team.message}</p>}
      </div>

      <Button type="submit" className="w-full my-4" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}

export default CreateUserForm;