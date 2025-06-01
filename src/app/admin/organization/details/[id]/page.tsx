"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  FileImage,
  Camera,
  UserCheck,
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Shield,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle,
  Sparkles,
  Eye,
  Users,
  Building
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_ROUTES } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  logo: string | null;
  website: string | null;
  managementName: string;
  designation: string;
  managementRepresentative: string;
  consultantEnquiry: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    branches: number;
  };
}

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchOrganizationDetails();
    }
  }, [params.id]);

  const fetchOrganizationDetails = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(
        `${API_ROUTES.AUTH.ORGANIZATION}?id=${params.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Your session has expired. Please login again");
          return;
        }
        throw new Error("Failed to fetch organization details");
      }

      const data = await response.json();
      setOrganization(data.organization);
    } catch (error) {
      setError("Failed to load organization details");
      toast.error("Error loading organization details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!organization) return;

    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(
        `${API_ROUTES.AUTH.ORGANIZATION}?id=${organization.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Your session has expired. Please login again");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete organization");
      }

      toast.success("Organization deleted successfully");
      router.push("/admin/organization/view");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete organization"
      );
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Organization</h3>
              <p className="text-sm text-gray-600">Fetching organization details...</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Organization Not Found</h3>
              <p className="text-sm text-gray-600 mb-6">{error || "The requested organization could not be found"}</p>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="min-w-[120px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        {/* Compact Header with Logo */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="h-1.5 w-1.5 text-white" />
                  </div>
                </motion.div>
                
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {organization.name}
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">
                    Organization Details & Information
                  </p>
                </div>

                {/* Organization Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="ml-4"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white">
                    {organization.logo ? (
                      <img
                        src={organization.logo}
                        alt="Organization Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={`/admin/organization/edit/${organization.id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Organization
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Unified Card Component */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl shadow-black/10 rounded-2xl overflow-hidden">
            {/* Content */}
            <CardContent className="p-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Organization Details */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-md flex items-center justify-center">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Organization Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Organization Name */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <Building2 className="h-3 w-3 text-teal-600" />
                        Organization Name
                      </Label>
                      <Input
                        value={organization.name}
                        readOnly
                        className="bg-gray-50/80 border-gray-200 text-sm focus:bg-white transition-colors duration-200 font-medium"
                      />
                    </div>

                    {/* Management Name */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <User className="h-3 w-3 text-teal-600" />
                        Management Name
                      </Label>
                      <Input
                        value={organization.managementName}
                        readOnly
                        className="bg-gray-50/80 border-gray-200 text-sm focus:bg-white transition-colors duration-200"
                      />
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <UserCheck className="h-3 w-3 text-teal-600" />
                        Designation
                      </Label>
                      <Input
                        value={organization.designation}
                        readOnly
                        className="bg-gray-50/80 border-gray-200 text-sm focus:bg-white transition-colors duration-200"
                      />
                    </div>

                    {/* Management Representative */}
                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <User className="h-3 w-3 text-teal-600" />
                        Management Representative
                      </Label>
                      <Input
                        value={organization.managementRepresentative}
                        readOnly
                        className="bg-gray-50/80 border-gray-200 text-sm focus:bg-white transition-colors duration-200"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                      <Mail className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email with Copy Button */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <Mail className="h-3 w-3 text-teal-600" />
                        Email Address
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={organization.email}
                          readOnly
                          className="bg-gray-50/80 border-gray-200 text-sm focus:bg-white transition-colors duration-200 flex-1"
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(organization.email, 'Email')}
                            className="px-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                          >
                            {copiedField === 'Email' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Mobile with Copy Button */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <Phone className="h-3 w-3 text-teal-600" />
                        Mobile Number
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={organization.mobile}
                          readOnly
                          className="bg-gray-50/80 border-gray-200 text-sm focus:bg-white transition-colors duration-200 flex-1"
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(organization.mobile, 'Mobile')}
                            className="px-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                          >
                            {copiedField === 'Mobile' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Website with Visit Button */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <Globe className="h-3 w-3 text-teal-600" />
                        Website
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={organization.website || "Not provided"}
                          readOnly
                          className="bg-gray-50/80 border-gray-200 text-sm focus:bg-white transition-colors duration-200 flex-1"
                        />
                        {organization.website && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(organization.website!, '_blank')}
                              className="px-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Address with Copy Button */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-md flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Address Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold">
                      <MapPin className="h-3 w-3 text-teal-600" />
                      Full Address
                    </Label>
                    <div className="flex gap-2 items-start">
                      <Textarea
                        value={organization.address}
                        readOnly
                        className="min-h-[80px] bg-gray-50/80 border-gray-200 resize-none text-sm focus:bg-white transition-colors duration-200 flex-1"
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-0"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(organization.address, 'Address')}
                          className="px-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        >
                          {copiedField === 'Address' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Settings */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Organization Settings</h3>
                  </div>

                  <motion.div 
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200",
                      organization.consultantEnquiry 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                        : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                    )}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Checkbox
                      id="consultantEnquiry"
                      checked={organization.consultantEnquiry}
                      disabled
                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-gray-800 cursor-pointer">
                        Consultant Enquiry System
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        {organization.consultantEnquiry 
                          ? "Consultant enquiries are enabled for this organization" 
                          : "Consultant enquiries are disabled for this organization"
                        }
                      </p>
                    </div>
                    <Badge 
                      variant={organization.consultantEnquiry ? "default" : "secondary"}
                      className={cn(
                        "ml-auto",
                        organization.consultantEnquiry 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-gray-500 hover:bg-gray-600"
                      )}
                    >
                      {organization.consultantEnquiry ? "Enabled" : "Disabled"}
                    </Badge>
                  </motion.div>
                </motion.div>

                {/* Timestamps */}
                <motion.div variants={itemVariants} className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-md flex items-center justify-center">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Timeline Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <Calendar className="h-3 w-3 text-teal-600" />
                        Created Date
                      </Label>
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(organization.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(organization.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold">
                        <Clock className="h-3 w-3 text-teal-600" />
                        Last Updated
                      </Label>
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(organization.updatedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(organization.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Delete Confirmation Dialog */}
        <AnimatePresence>
          {deleteDialogOpen && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="max-w-md border-0 bg-white/95 backdrop-blur-lg shadow-2xl">
                <DialogHeader className="text-center pb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </motion.div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Delete Organization
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-2">
                    This action cannot be undone. This will permanently delete the
                    organization and all associated data.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 rounded-lg border border-red-200"
                  >
                    <p className="text-red-800 text-sm font-medium mb-2">
                      Are you sure you want to delete{" "}
                      <span className="font-bold">{organization?.name}</span>?
                    </p>
                    {organization?._count?.branches ? (
                      <div className="mt-3 p-3 bg-red-100 rounded-md border border-red-200">
                        <p className="text-red-900 text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Warning: Cannot Delete
                        </p>
                        <p className="text-red-800 text-sm mt-1">
                          This organization has{" "}
                          <span className="font-semibold">
                            {organization._count.branches} associated{" "}
                            {organization._count.branches === 1 ? "branch" : "branches"}
                          </span>
                          . You need to delete them first.
                        </p>
                      </div>
                    ) : null}
                  </motion.div>
                </div>

                <DialogFooter className="flex gap-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      variant="destructive"
                      onClick={handleDeleteOrganization}
                      disabled={
                        organization?._count?.branches
                          ? organization._count.branches > 0
                          : false
                      }
                      className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Organization
                    </Button>
                  </motion.div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  </div>
);
}