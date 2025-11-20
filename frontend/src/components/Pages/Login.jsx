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
import { validateInput } from "../ValidateSchema/validateInput";
import { loginUserSchema } from "../ValidateSchema/authInputValidationShema";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  const [finalMsg, setFinalMsg] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const {setUser} = useContext(UserContext);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {

    setLoading(true);
    setErrorMsg({});
    setFinalMsg("");

    // const result = validateInput(loginUserSchema, data);
    // if (!result.success) {
    //   console.log("Validation errors:", result?.errors);
    //   setErrorMsg(result?.errors);
    //   setLoading(false);
    //   return;
    // }
    // // If validation passed
    // const validData = result.data; 
    const validData=data;
    try {
      const response = await axios.post(`${apiUrl}/auth/login`,validData,{withCredentials:true});
      setUser(response?.data?.user);
      setFinalMsg(response?.data?.message || "User Logged in Successfully");

      setTimeout(()=>{
        navigate("/");
      },1500)

    } catch (err) {
        if(err?.response?.status === 400 ){
            setErrorMsg(err?.response?.data?.errors || "Something Went Wrong");
          }
        else{
            setFinalMsg(err?.response?.data?.message || "Something Went Wrong");
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
              <Label htmlFor="username" className="my-1">Username</Label>
              <Input
                id="username"
                placeholder="you@example.com"
                {...register("username")}
              />
              {errorMsg.username && (
                <p className="text-sm text-red-500 mt-1">{errorMsg.username}</p>
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
              {errorMsg.password && (
                <p className="text-sm text-red-500 mt-1">{errorMsg.password}</p>
              )}
            </div>

            {/* Final Message */}
            {finalMsg && (
              <div className="flex items-center gap-2 bg-yellow-300 text-sm p-2 rounded-md">
                <AlertCircle size={16} />
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
