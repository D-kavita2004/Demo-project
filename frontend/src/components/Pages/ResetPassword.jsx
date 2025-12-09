import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";
import api from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

// Validation schema
const resetSchema = z.object({
  password: z.string().trim().regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,128}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character (@$!%*?&), and be 6-128 characters long",
    ),
  confirmPassword: z.string().trim().min(1, "Password is required"),

}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const {token} = useParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password/${token}`, {
        updatedPassword: data.password,
      });
      toast.success(res?.data?.message);
      setTimeout(() => {
         navigate("/login");
      }, 700);
    } catch (err) {
       if (err?.response?.status === 400) {
            setError("password",{message:err?.response?.data?.errors.updatedPassword})
            return;
        }  
        toast.error(err?.response?.data?.message || err?.response?.statusText || "Oops! Password cannot be changed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-200 px-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="text-center bg-white px-6 py-5">
          <div className="flex justify-center mb-3">
            <div className="p-4 bg-blue-100 rounded-full animate-pulse">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Reset Password</CardTitle>
          <p className="text-gray-500 mt-1">Enter a new password to secure your account.</p>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 bg-gray-50 px-6 py-6">
            {/* Password */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pr-12"
                  {...register("password")}
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  className="pr-12"
                  {...register("confirmPassword")}
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-white px-6 py-6">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:scale-105 transform transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
