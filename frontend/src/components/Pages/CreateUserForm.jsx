import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema } from "../ValidateSchema/authInputValidationShema";
import api from "@/api/axiosInstance";
import { useState,useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
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

const CreateUserForm = ({ suppliersList,setUsersList }) => {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = async (data) => {
    try {
     
      const res = await api.post(`${apiUrl}/user/register`, data, {
        withCredentials: true,
      });
        toast.success(res?.data?.message || "User created successfully");
        setOpen(false);
        setUsersList(prev => [...prev, res?.data?.data]);
        
    } catch (err) {
       toast.error(err?.response?.data?.message || err?.response?.statusText || "Oops! User Cannot be Created");
    }
  };
  useEffect(() => {
    if (open) {
      reset(); 
    }
  }, [open, reset]);


  return (
    <AlertDialog  open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 w-full sm:w-auto">
                + Create New User
            </Button>
        </AlertDialogTrigger>

            <AlertDialogContent className="max-w-lg w-full">
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
                        <Select value={watch("team")}  onValueChange={(v) => setValue("team", v)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliersList.map((s) => (
                              <SelectItem key={s.supplierCode} value={s.supplierCode}>
                                {s.supplierName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {errors.team && (
                          <p className="text-red-500 text-xs">{errors.team.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t" />

                  <AlertDialogFooter>
                    <div className="w-full flex justify-between items-center gap-3">

                      {/* CANCEL BUTTON */}
                      <AlertDialogCancel
                        type="button"
                        className="
                          w-[48%]
                          py-3
                          rounded-xl
                          font-medium
                          border border-gray-300
                          bg-white 
                          text-gray-800 
                          shadow-sm 
                          hover:bg-gray-100 
                          hover:shadow-md
                          active:scale-[0.98]
                          transition-all
                        "
                      >
                        Cancel
                      </AlertDialogCancel>

                      {/* SUBMIT BUTTON */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="
                          w-[48%]
                          py-3
                          rounded-xl
                          font-semibold
                          bg-blue-600 
                          text-white 
                          shadow-sm 
                          hover:bg-blue-700 
                          hover:shadow-md
                          active:scale-[0.98]
                          transition-all
                        "
                      >
                        {isSubmitting ? "Creating..." : "Create User"}
                      </Button>

                    </div>
                  </AlertDialogFooter>
                    
                </form>
            </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateUserForm;
