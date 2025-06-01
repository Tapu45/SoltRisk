"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Upload, 
  X, 
  CheckCircle,
  FileImage,
  Camera,
  UserCheck,
  ArrowLeft,
  Save,
  Sparkles,
  Shield,
  FileCheck,
  ImageIcon,
  Info,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { API_ROUTES } from "@/lib/api";
import { cn } from "@/lib/utils";

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  managementName: z.string().min(1, "Management name is required"),
  designation: z.string().min(1, "Designation is required"),
  address: z.string().min(1, "Address is required"),
  managementRepresentative: z.string().min(1, "Management representative is required"),
  email: z.string().email("Valid email address is required"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  website: z.string().url("Valid website URL is required").optional().nullable(),
  consultantEnquiry: z.boolean(),
  logo: z.string().optional().nullable(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      managementName: "",
      designation: "",
      address: "",
      managementRepresentative: "",
      email: "",
      mobile: "",
      website: "",
      consultantEnquiry: false,
      logo: null,
    },
  });

  const watchedValues = watch();
  const watchConsultantEnquiry = watch("consultantEnquiry");

  // Calculate form completion progress
  const calculateProgress = () => {
    const requiredFields = ['name', 'managementName', 'designation', 'address', 'managementRepresentative', 'email', 'mobile'];
    const completedFields = requiredFields.filter(field => watchedValues[field as keyof OrganizationFormValues]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const handleLogoChange = (file: File) => {
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setValue("logo", base64String);
        setTimeout(() => setUploadProgress(0), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleLogoChange(file);
    } else {
      toast.error("Please drop an image file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setValue("logo", null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: OrganizationFormValues) => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const response = await fetch(API_ROUTES.AUTH.ORGANIZATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create organization");
      }

      toast.success("Organization created successfully");
      router.push("/admin/organization/view");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const formProgress = calculateProgress();

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        {/* Back Navigation */}
        <motion.div 
          variants={itemVariants}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </motion.div>

        {/* Unified Component - Header + Form */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl shadow-black/10 rounded-2xl overflow-hidden">
            {/* Header Section */}
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-blue-500/5 to-purple-500/5 blur-3xl" />
              
              <div className="relative bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50 p-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="h-2 w-2 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Create New Organization
                    </h1>
                    <p className="text-gray-600 mt-1 font-medium text-sm">
                      Add a new organization to your management system
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {/* Compact Logo Upload Section */}
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Organization Logo</h3>
                        <p className="text-sm text-gray-600">Upload your organization's logo for branding</p>
                      </div>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-6 items-start">
                      {/* Compact Upload Area */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          className={cn(
                            "relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 group overflow-hidden",
                            isDragOver 
                              ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-blue-50 scale-105 shadow-lg' 
                              : 'border-gray-300 hover:border-teal-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-teal-50/30'
                          )}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          
                          <motion.div
                            animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                            className="relative z-0 flex flex-col items-center gap-3"
                          >
                            <motion.div 
                              className={cn(
                                "p-4 rounded-xl transition-all duration-300",
                                isDragOver 
                                  ? "bg-gradient-to-br from-teal-500 to-blue-600 shadow-xl" 
                                  : "bg-gradient-to-br from-gray-100 to-white group-hover:from-teal-100 group-hover:to-blue-100 shadow-lg"
                              )}
                              whileHover={{ rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.6 }}
                            >
                              <Upload className={cn(
                                "h-8 w-8 transition-colors duration-300",
                                isDragOver ? "text-white" : "text-gray-600 group-hover:text-teal-600"
                              )} />
                            </motion.div>
                            
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-gray-800">
                                {isDragOver ? 'Drop your logo here!' : 'Upload Organization Logo'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Drag & drop or click to browse
                              </p>
                              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <ImageIcon className="h-3 w-3" />
                                PNG, JPG up to 5MB
                              </div>
                            </div>
                          </motion.div>

                          {/* Upload Progress */}
                          <AnimatePresence>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute bottom-3 left-3 right-3"
                              >
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-medium text-gray-700">Uploading...</span>
                                    <span className="text-xs text-gray-500 ml-auto">{uploadProgress}%</span>
                                  </div>
                                  <Progress value={uploadProgress} className="h-1" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>

                      {/* Compact Preview Area */}
                      <AnimatePresence mode="wait">
                        {logoPreview ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative"
                          >
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                                    <FileCheck className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="font-medium text-gray-800 text-sm">Logo Preview</span>
                                </div>
                                <motion.button
                                  type="button"
                                  onClick={removeLogo}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <X className="h-3 w-3" />
                                </motion.button>
                              </div>
                              
                              {/* Preview */}
                              <div className="relative group">
                                <div className="aspect-square bg-gradient-to-br from-gray-50 to-white rounded-lg overflow-hidden border border-dashed border-gray-200 group-hover:border-teal-300 transition-colors duration-300">
                                  <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="w-full h-full object-contain p-3"
                                  />
                                </div>
                              </div>
                              
                              {/* Success indicator */}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-xs font-medium text-green-800">Logo uploaded successfully</span>
                              </motion.div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-full min-h-[200px]"
                          >
                            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium text-sm">No logo selected</p>
                              <p className="text-xs text-gray-400 mt-1">Upload an image to see preview</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Enhanced Form Fields */}
                  <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Organization Details</h3>
                        <p className="text-sm text-gray-600">Enter the basic information about your organization</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {/* Organization Name */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold">
                          <Building2 className="h-4 w-4 text-teal-600" />
                          Organization Name<span className="text-red-500">*</span>
                        </Label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="name"
                            placeholder="Enter organization name"
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300",
                              errors.name && "border-red-500 focus:ring-red-500/20"
                            )}
                            {...register("name")}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.name && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-red-600"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.name.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Management Name */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="managementName" className="flex items-center gap-2 text-sm font-semibold">
                          <User className="h-4 w-4 text-teal-600" />
                          Management Name<span className="text-red-500">*</span>
                        </Label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="managementName"
                            placeholder="Enter management name"
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300",
                              errors.managementName && "border-red-500 focus:ring-red-500/20"
                            )}
                            {...register("managementName")}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.managementName && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-red-600"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.managementName.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Designation */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="designation" className="flex items-center gap-2 text-sm font-semibold">
                          <UserCheck className="h-4 w-4 text-teal-600" />
                          Designation<span className="text-red-500">*</span>
                        </Label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="designation"
                            placeholder="Enter designation"
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300",
                              errors.designation && "border-red-500 focus:ring-red-500/20"
                            )}
                            {...register("designation")}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.designation && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-red-600"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.designation.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Management Representative */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="managementRepresentative" className="flex items-center gap-2 text-sm font-semibold">
                          <User className="h-4 w-4 text-teal-600" />
                          Management Representative<span className="text-red-500">*</span>
                        </Label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="managementRepresentative"
                            placeholder="Enter management representative"
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300",
                              errors.managementRepresentative && "border-red-500 focus:ring-red-500/20"
                            )}
                            {...register("managementRepresentative")}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.managementRepresentative && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-red-600"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.managementRepresentative.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Email */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
                          <Mail className="h-4 w-4 text-teal-600" />
                          Email<span className="text-red-500">*</span>
                        </Label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="email"
                            type="email"
                            placeholder="example@company.com"
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300",
                              errors.email && "border-red-500 focus:ring-red-500/20"
                            )}
                            {...register("email")}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.email && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-red-600"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.email.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Mobile */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="mobile" className="flex items-center gap-2 text-sm font-semibold">
                          <Phone className="h-4 w-4 text-teal-600" />
                          Mobile<span className="text-red-500">*</span>
                        </Label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="mobile"
                            placeholder="Enter mobile number"
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300",
                              errors.mobile && "border-red-500 focus:ring-red-500/20"
                            )}
                            {...register("mobile")}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.mobile && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-red-600"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.mobile.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Website */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="website" className="flex items-center gap-2 text-sm font-semibold">
                          <Globe className="h-4 w-4 text-teal-600" />
                          Website
                        </Label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="website"
                            placeholder="https://www.example.com"
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300",
                              errors.website && "border-red-500 focus:ring-red-500/20"
                            )}
                            {...register("website")}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.website && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-red-600"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.website.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Consultant Enquiry */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="consultantEnquiry" className="flex items-center gap-2 text-sm font-semibold">
                          <Shield className="h-4 w-4 text-teal-600" />
                          Consultant Enquiry
                        </Label>
                        <motion.div 
                          className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Checkbox
                              id="consultantEnquiry"
                              checked={watchConsultantEnquiry}
                              onCheckedChange={(checked) => {
                                setValue("consultantEnquiry", checked as boolean);
                              }}
                              className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                            />
                          </motion.div>
                          <Label
                            htmlFor="consultantEnquiry"
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Enable consultant enquiries for this organization
                          </Label>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Address - Full width */}
                    <motion.div variants={itemVariants} className="space-y-3">
                      <Label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        Address<span className="text-red-500">*</span>
                      </Label>
                      <motion.div whileFocus={{ scale: 1.01 }}>
                        <Textarea
                          id="address"
                          placeholder="Enter full address"
                          className={cn(
                            "min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-gray-300 resize-none",
                            errors.address && "border-red-500 focus:ring-red-500/20"
                          )}
                          {...register("address")}
                        />
                      </motion.div>
                      <AnimatePresence>
                        {errors.address && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-sm text-red-600"
                          >
                            <AlertCircle className="h-3 w-3" />
                            {errors.address.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>

              {/* Enhanced Footer */}
              <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200/50 p-8 rounded-b-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>All information is encrypted and secure</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                        className="min-w-[120px] border-gray-300 hover:bg-gray-50"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={isLoading || !isValid}
                        className="min-w-[180px] bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? "Creating..." : "Create Organization"}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  </div>
);
}