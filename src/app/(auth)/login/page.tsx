"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { API_ROUTES } from "@/lib/api"
import { EyeIcon, EyeOffIcon } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  })

 async function onSubmit(data: LoginFormValues) {
  setIsLoading(true)
  
  try {
    const response = await fetch(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || "Login failed")
    }
    
    // Store the auth token and user data in localStorage
    localStorage.setItem("auth_token", result.token)
    localStorage.setItem("user", JSON.stringify(result.user))
    
    // If "remember me" is checked, set a longer expiry
    if (data.rememberMe) {
      localStorage.setItem("remember_me", "true")
      // You could also store the expiry date for the token
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30) // 30 days
      localStorage.setItem("token_expiry", expiryDate.toISOString())
    }
    
    toast.success("Login successful")
    
    // Redirect based on user role
    switch (result.user.role) {
      case "ADMIN":
        router.push("/admin/dashboard")
        break
      case "CLIENT":
        router.push("/client/dashboard")
        break
      case "VENDOR":
        router.push("/vendor/dashboard")
        break
      case "STAFF":
        router.push("/staff/dashboard")
        break
      default:
        router.push("/dashboard")
    }
    
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Login failed")
  } finally {
    setIsLoading(false)
  }
}

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - SoltRisk Image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#00e5bc] via-[#0A0530] to-[#081a4b] relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Security patterns background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/security-pattern.svg')] bg-repeat"></div>
        </div>
        
        {/* Lock icon */}
        <div className="absolute inset-0 flex items-end justify-center pb-20 opacity-15">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="180" 
            height="180" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-white"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        {/* Logo centered */}
        <div className="relative z-10 w-2/3 max-w-xs flex items-center justify-center">
          <Image
            src="/soltrisk.png" 
            alt="SoltRisk"
            width={300}
            height={150}
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome Back!</h1>
            <p className="text-muted-foreground mt-2">
              Login to continue
            </p>
          </div>
          
          <Card className="shadow-none border-0">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      className="pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-gray-500" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" {...register("rememberMe")} />
                    <label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#081a4b] hover:bg-[#0a2158] text-white"
                  disabled={isLoading}
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}