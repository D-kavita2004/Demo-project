import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// Validation schema
const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export default function ForgotPassword() {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
        email: data.email,
      });

      toast.success(res?.data?.message);
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error?.response?.statusText || "Oops! Could not send the email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-200 px-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="text-center bg-white px-6 py-5">
          <div className="flex justify-center mb-3">
            <div className="p-4 bg-blue-100 rounded-full animate-pulse">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Forgot Password</CardTitle>
          <p className="text-gray-500 mt-1">
            Enter your email address to receive a reset link.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 bg-gray-50 px-6 py-3">
            {/* Email */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pr-3"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}

            </div>
          </CardContent>

          <CardFooter className="bg-white px-6 py-6">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:scale-105 transform transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
              {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
