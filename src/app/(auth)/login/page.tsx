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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { API_ROUTES } from "@/lib/api"
import { EyeIcon, EyeOffIcon, Shield, Lock, Key, CheckCircle } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
})

const setupPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>
type SetupPasswordFormValues = z.infer<typeof setupPasswordSchema>

// Custom Security Pattern Component
const SecurityPattern = () => {
  return (
    <div className="absolute inset-0 opacity-10">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Security icons scattered */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left area */}
        <Shield className="absolute top-20 left-20 w-8 h-8 text-white opacity-20 rotate-12" />
        <Lock className="absolute top-32 left-40 w-6 h-6 text-white opacity-15 -rotate-6" />
        <Key className="absolute top-16 left-60 w-7 h-7 text-white opacity-25 rotate-45" />
        
        {/* Top right area */}
        <Shield className="absolute top-24 right-24 w-6 h-6 text-white opacity-20 -rotate-12" />
        <Key className="absolute top-40 right-16 w-8 h-8 text-white opacity-15 rotate-30" />
        <Lock className="absolute top-12 right-44 w-5 h-5 text-white opacity-25 rotate-15" />
        
        {/* Bottom left area */}
        <Lock className="absolute bottom-32 left-16 w-7 h-7 text-white opacity-20 rotate-45" />
        <Shield className="absolute bottom-20 left-36 w-6 h-6 text-white opacity-15 -rotate-30" />
        <Key className="absolute bottom-40 left-52 w-5 h-5 text-white opacity-25 rotate-60" />
        
        {/* Bottom right area */}
        <Key className="absolute bottom-28 right-20 w-7 h-7 text-white opacity-20 -rotate-45" />
        <Shield className="absolute bottom-16 right-40 w-8 h-8 text-white opacity-15 rotate-15" />
        <Lock className="absolute bottom-36 right-12 w-6 h-6 text-white opacity-25 -rotate-15" />
        
        {/* Center scattered */}
        <Shield className="absolute top-1/2 left-1/4 w-5 h-5 text-white opacity-15 rotate-90" />
        <Lock className="absolute top-1/3 right-1/3 w-7 h-7 text-white opacity-20 -rotate-45" />
        <Key className="absolute top-2/3 left-1/3 w-6 h-6 text-white opacity-15 rotate-120" />
      </div>
      
      {/* Hexagonal pattern overlay */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="hexagon" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon
                points="10,0 20,5.77 20,11.55 10,17.32 0,11.55 0,5.77"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagon)" />
        </svg>
      </div>
    </div>
  )
}

// Setup Password Component
const SetupPasswordForm = ({ 
  userData, 
  onSuccess 
}: { 
  userData: { email: string; password: string }; 
  onSuccess: () => void 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SetupPasswordFormValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    },
  })

  const newPassword = watch("newPassword")

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    strength = Object.values(checks).filter(Boolean).length
    return { strength, checks }
  }

  const passwordStrength = getPasswordStrength(newPassword || "")

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return "bg-red-500"
    if (strength < 4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength < 2) return "Weak"
    if (strength < 4) return "Medium"
    return "Strong"
  }

  async function onSubmit(data: SetupPasswordFormValues) {
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_ROUTES.AUTH.LOGIN}?action=setup-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          currentPassword: userData.password,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Password setup failed")
      }
      
      toast.success("Password updated successfully!")
      onSuccess()
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password setup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border border-blue-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Setup Your Password
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your current password is temporary. Please create a new secure password.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="pr-10"
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
              
              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      passwordStrength.strength < 2 ? "text-red-500" : 
                      passwordStrength.strength < 4 ? "text-yellow-500" : "text-green-500"
                    }`}>
                      {getStrengthText(passwordStrength.strength)}
                    </span>
                  </div>
                  
                  {/* Password requirements checklist */}
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.length ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordStrength.checks.length ? "text-green-500" : "text-gray-300"}`} />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.lowercase ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordStrength.checks.lowercase ? "text-green-500" : "text-gray-300"}`} />
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordStrength.checks.uppercase ? "text-green-500" : "text-gray-300"}`} />
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.number ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordStrength.checks.number ? "text-green-500" : "text-gray-300"}`} />
                      One number
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.special ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordStrength.checks.special ? "text-green-500" : "text-gray-300"}`} />
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              disabled={isLoading || passwordStrength.strength < 3}
            >
              {isLoading ? "Setting up..." : "Setup Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTemporaryPassword, setIsTemporaryPassword] = useState(false)
  const [temporaryUserData, setTemporaryUserData] = useState<{ email: string; password: string } | null>(null)
  
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
      
      // Check if user has temporary password that needs to be changed
      if (result.requiresPasswordSetup) {
        setIsTemporaryPassword(true)
        setTemporaryUserData({
          email: data.email,
          password: data.password
        })
        return
      }
      
      // Store the auth token and user data in localStorage
      localStorage.setItem("auth_token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))
      
      // If "remember me" is checked, set a longer expiry
      if (data.rememberMe) {
        localStorage.setItem("remember_me", "true")
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30) // 30 days
        localStorage.setItem("token_expiry", expiryDate.toISOString())
      }
      
      toast.success("Login successful")
      
      // Redirect based on user role
      redirectBasedOnRole(result.user.role)
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSetupSuccess = async () => {
  try {
    // After successful password setup, get the fresh user data from localStorage or make a fresh login
    const token = localStorage.getItem("auth_token")
    if (token) {
      // Parse the token to get user data or make a request to get fresh user data
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      
      toast.success("Password setup complete! Redirecting...")
      
      // Redirect based on user role
      setTimeout(() => {
        redirectBasedOnRole(user.role)
      }, 1500)
    } else {
      // If no token, redirect to login
      router.push("/login")
    }
  } catch (error) {
    console.error("Error after password setup:", error)
    router.push("/login")
  }
}

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
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
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - SoltRisk Image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#00e5bc] via-[#0A0530] to-[#081a4b] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Custom Security Pattern */}
          <SecurityPattern />
          
          {/* Large Lock icon at bottom */}
          <div className="absolute inset-0 flex items-end justify-center pb-20 opacity-15">
            <Lock className="w-44 h-44 text-white" strokeWidth={0.8} />
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
      
      {/* Right side - Login form or Setup Password */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        {isTemporaryPassword && temporaryUserData ? (
          <SetupPasswordForm 
            userData={temporaryUserData}
            onSuccess={handlePasswordSetupSuccess}
          />
        ) : (
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="text-muted-foreground mt-2">
                Login to continue your cybersecurity journey
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
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}