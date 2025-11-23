import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import axios from "axios";
import { UserContext } from "../Constants/userContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUserSchema } from "../ValidateSchema/authInputValidationShema";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [finalMsg, setFinalMsg] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const {setUser} = useContext(UserContext);
  
  const { register, handleSubmit, setError, formState:{errors}} = useForm({
    resolver:zodResolver(loginUserSchema),
    defaultValues: {
        username: "",
        password: "",
    }
  });

  const onSubmit = async (data) => {

    setLoading(true);
    setFinalMsg("");

    try {
      const response = await axios.post(`${apiUrl}/auth/login`,data,{withCredentials:true});
      setUser(response?.data?.user);
      setFinalMsg(response?.data?.message || "User Logged in Successfully");

      setTimeout(()=>{
        navigate("/");
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
        setFinalMsg(err?.response?.data?.message || "SignUp Falied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Welcome Back 👋
          </CardTitle>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            Please login to your account
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="username" className="my-1">Username</Label>
              <Input
                id="username"
                placeholder="you@example.com"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
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
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Final Message */}
            {finalMsg && (
              <div className="flex items-center gap-2 bg-yellow-300 text-sm p-2 rounded-md text-center">
                {/* <AlertCircle size={16} /> */}
                <span>{finalMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
