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

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const {setUser} = useContext(UserContext);
  const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  setLoading(true);
  setErrorMsg("");

  try {
    const response = await axios.post(
      `${apiUrl}/auth/login`,
      data,
      {
        withCredentials: true, //allows cookies to be sent and received
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Login Successful:", response.data);
     setUser(response.data.user);
    // You can redirect or store tokens here
    navigate("/");

  } catch (err) {
    console.error("Login Error:", err);
    if (err.response && err.response.data) {
      setErrorMsg(err.response.data.message);
    } else {
      setErrorMsg("Something went wrong");
    }
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                placeholder="you@example.com"
                {...register("username", { required: "username is required" })}
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
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
