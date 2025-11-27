import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { registerUserSchema } from "../ValidateSchema/authInputValidationShema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const Signup = () => {

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [finalMsg, setFinalMsg] = useState(""); //final msg whether the registration failed or passed

  const { register, handleSubmit, setError, formState:{errors} } = useForm({
    resolver:zodResolver(registerUserSchema),
    defaultValues:{
      username:"",
      team:"",
      password:"",
      confirmPassword:""
    }
  });
  
  const onSubmit = async (data) => {

    setLoading(true);
    setFinalMsg("");

    try {
      const response = await axios.post(`${apiUrl}/auth/register`,data);
      setFinalMsg(response?.data?.message || "Account created successfully! Redirecting...");

      setTimeout(()=>{
        navigate("/login");
      },1000)

    } catch (err) {
        if (err?.response?.status === 400) {
            const backendErrors = err?.response?.data?.errors;

            if (backendErrors) {
              Object.keys(backendErrors).forEach((field) => {
                setError(field, { message: backendErrors[field] });
              });
            }
            
            return;
        }
        setFinalMsg(err?.response?.data?.message || "SignUp Failed");
        
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Create Your Account ✨
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="username" className="my-1">username</Label>
              <Input
                id="username"
                type="email"
                placeholder="adam@gmail.com"
                {...register("username")}
              />
              {errors?.username && (
                <p className="text-sm text-red-500 mt-1">{errors?.username?.message}</p>
              )}
            </div>

            {/* Team Selection */}
            <div>
              <Label htmlFor="team" className="my-1">Team</Label>
              <select
                id="team"
                {...register("team")}
                className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select your team</option>
                <option value="Quality">Quality</option>
                <option value="Production">Production</option>
              </select>
              {errors?.team && (
                <p className="text-sm text-red-500 mt-1">{errors?.team?.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="my-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors?.password && (
                <p className="text-sm text-red-500 mt-1">{errors?.password?.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="my-1">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors?.confirmPassword?.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {/* {errors && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                <AlertCircle size={16} />
                <span>{errors}</span>
              </div>
            )} */}

            {/* Final Message */}
            {finalMsg && (
              <div className="flex items-center gap-2 bg-yellow-300 text-sm p-2 rounded-md text-center">
                {/* <AlertCircle size={16} /> */}
                <span>{finalMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
