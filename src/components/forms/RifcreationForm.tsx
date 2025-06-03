"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { API_ROUTES } from "@/lib/api";
import {
  CheckCircle,
  Send,
  ArrowRight,
  Shield,
  Users,
  User,
  Mail,
  Building,
  Target,
  Calendar,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Assignment, Question } from "@/types/rif.types";

interface RifCreationFormProps {
  onSuccess: () => void;
  currentUser: any;
}

const RifCreationForm: React.FC<RifCreationFormProps> = ({
  onSuccess,
  currentUser,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [section1Answers, setSection1Answers] = useState<any[]>([]);
  const [assignment, setAssignment] = useState<Assignment>({
    name: "",
    email: "",
    department: "",
    role: "",
    dueDate: "",
    comments: "",
  });

  // State for third party type cascading dropdown
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Fetch Section 1 form
  const { data: rifForm, isLoading } = useQuery({
    queryKey: ["section1-form"],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.RIF.GET_SECTION1_FORM);
      if (!response.ok) throw new Error("Failed to fetch form");
      return response.json();
    },
  });

  // Submit RIF initiation
  const initiateRifMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(API_ROUTES.RIF.INITIATE_RIF, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to initiate RIF"
        );
      }
      return response.json();
    },
    onSuccess: (data) => {
      const message = data.vendorCreated
        ? `RIF assigned successfully! New vendor created and email sent to ${assignment.email} by ${currentUser.name}.`
        : `RIF assigned successfully! Email sent to ${assignment.email} by ${currentUser.name}.`;

      toast.success(message);
      onSuccess();

      // Reset form
      setCurrentStep(1);
      setSection1Answers([]);
      setSelectedCategory("");
      setSelectedSubcategory("");
      setAssignment({
        name: "",
        email: "",
        department: "",
        role: "",
        dueDate: "",
        comments: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to initiate RIF");
    },
  });

  const handleAnswerChange = (questionId: string, value: any) => {
    setSection1Answers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, value } : a
        );
      } else {
        return [...prev, { questionId, value }];
      }
    });
  };

  // Handle category selection for third party type
  const handleCategoryChange = (questionId: string, categoryValue: string, question: Question) => {
    setSelectedCategory(categoryValue);
    setSelectedSubcategory(""); // Reset subcategory when category changes
    
    // Update the main category answer
    handleAnswerChange(questionId, categoryValue);
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (questionId: string, subcategoryValue: string) => {
    setSelectedSubcategory(subcategoryValue);
    
    // Create composite value: "Category | Subcategory"
    const compositeValue = `${selectedCategory} | ${subcategoryValue}`;
    
    // Update the answer with composite value
    handleAnswerChange(questionId, compositeValue);
  };

  // Get subcategories for selected category
  const getSubcategories = (question: Question) => {
    if (question.questionKey !== "third_party_type" || !selectedCategory) {
      return [];
    }
    
    const choices = question.options?.choices || [];
    const selectedCategoryChoice = choices.find((choice: any) => choice.value === selectedCategory);
    return selectedCategoryChoice?.subcategories || [];
  };

  const isSection1Complete = () => {
    if (!rifForm?.Sections?.[0]?.Questions) return false;
    const requiredQuestions = rifForm.Sections[0].Questions.filter(
      (q: Question) => q.isRequired
    );
    const answeredRequired = section1Answers.filter((a) => {
      const question = requiredQuestions.find(
        (q: Question) => q.id === a.questionId
      );
      return (
        question && a.value !== "" && a.value !== null && a.value !== undefined
      );
    });
    return answeredRequired.length === requiredQuestions.length;
  };

  const isAssignmentComplete = () => {
    return (
      assignment.name &&
      assignment.email &&
      assignment.department &&
      assignment.role &&
      assignment.dueDate
    );
  };

  const handleSubmit = () => {
    if (!isSection1Complete() || !isAssignmentComplete()) {
      toast.error("Please complete all required fields");
      return;
    }

    initiateRifMutation.mutate({
      section1Answers: section1Answers.map((answer) => ({
        questionId: answer.questionId,
        value: answer.value,
        questionOptions: rifForm.Sections[0].Questions.find(
          (q: Question) => q.id === answer.questionId
        )?.questionOptions,
      })),
      assignment: {
        name: assignment.name.trim(),
        email: assignment.email.trim(),
        department: assignment.department,
        role: assignment.role,
        dueDate: assignment.dueDate,
        comments: assignment.comments?.trim() || "",
      },
      adminUserId: currentUser.id,
    });
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer =
      section1Answers.find((a) => a.questionId === question.id)?.value || "";

    // Special handling for third party type with cascading dropdown
    if (question.questionKey === "third_party_type") {
      return renderThirdPartyTypeQuestion(question, currentAnswer);
    }

    switch (question.questionType) {
      case "TEXT":
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        );

      case "TEXTAREA":
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter your answer"
          />
        );

      case "SINGLE_CHOICE":
        // Convert all single choice to dropdown
        const singleChoices =
          question.questionOptions?.choices || question.options?.choices || [];
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="">Select an option</option>
            {singleChoices.map((choice: any) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      case "MULTIPLE_CHOICE":
        const selectedValues = Array.isArray(currentAnswer)
          ? currentAnswer
          : [];
        const multipleChoices =
          question.questionOptions?.choices || question.options?.choices || [];
        return (
          <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {multipleChoices.map((choice: any) => (
              <label
                key={choice.value}
                className="flex items-center group cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-all"
              >
                <input
                  type="checkbox"
                  value={choice.value}
                  checked={selectedValues.includes(choice.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, choice.value]
                      : selectedValues.filter((v) => v !== choice.value);
                    handleAnswerChange(question.id, newValues);
                  }}
                  className="mr-3 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-teal-700 transition-colors">
                  {choice.label}
                </span>
              </label>
            ))}
          </div>
        );

      case "DROPDOWN":
        const dropdownChoices =
          question.questionOptions?.choices || question.options?.choices || [];
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="">Select an option</option>
            {dropdownChoices.map((choice: any) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      case "DATE":
        return (
          <Input
            type="date"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        );

      case "BOOLEAN":
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="">Select an option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        );
    }
  };

  // Special render function for Third Party Type with cascading dropdown
  const renderThirdPartyTypeQuestion = (question: Question, currentAnswer: string) => {
    const choices = question.options?.choices || [];
    const subcategories = getSubcategories(question);
    
    // Parse current answer to extract category and subcategory if it's composite
    const isComposite = currentAnswer.includes(" | ");
    const displayCategory = isComposite ? currentAnswer.split(" | ")[0] : currentAnswer;
    const displaySubcategory = isComposite ? currentAnswer.split(" | ")[1] : "";

    // Update local state if we have a composite answer but local state is empty
    if (isComposite && !selectedCategory) {
      setSelectedCategory(displayCategory);
      setSelectedSubcategory(displaySubcategory);
    }

    return (
      <div className="space-y-4">
        {/* Main Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category
          </label>
          <select
            value={selectedCategory || displayCategory}
            onChange={(e) => handleCategoryChange(question.id, e.target.value, question)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="">Select a category</option>
            {choices.map((choice: any) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
                {choice.subcategories && choice.subcategories.length > 0 && 
                  ` (${choice.subcategories.length} subcategories)`
                }
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Dropdown - Only show if category has subcategories */}
        <AnimatePresence>
          {(selectedCategory || displayCategory) && subcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-l-4 border-teal-500 pl-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Specific Type
                  <span className="text-teal-600 ml-1">
                    ({choices.find((c: { value: string; }) => c.value === (selectedCategory || displayCategory))?.label})
                  </span>
                </label>
                <select
                  value={selectedSubcategory || displaySubcategory}
                  onChange={(e) => handleSubcategoryChange(question.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="">Select a specific type</option>
                  {subcategories.map((subcategory: string, index: number) => (
                    <option key={index} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Summary */}
        {(selectedCategory || displayCategory) && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-teal-600 mr-2" />
              <span className="font-medium text-teal-800">
                Selected: {selectedCategory || displayCategory}
              </span>
              {(selectedSubcategory || displaySubcategory) && (
                <span className="text-teal-600 ml-1">
                  → {selectedSubcategory || displaySubcategory}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading RIF form...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <Card className="border-0 bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onSuccess}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Create New RIF Assessment</h1>
                  <p className="text-blue-100 mt-1">
                    Complete the third-party information and assign to an internal reviewer
                  </p>
                </div>
              </div>
              <button
                onClick={onSuccess}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentStep >= 1
                      ? "bg-white text-teal-600 shadow-lg"
                      : "bg-white/30 text-white"
                  }`}
                  animate={{ scale: currentStep === 1 ? 1.1 : 1 }}
                >
                  {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
                </motion.div>
                
                <div className="flex-1 mx-4">
                  <motion.div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      currentStep >= 2 ? "bg-white" : "bg-white/30"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: currentStep >= 2 ? 1 : 0 }}
                    style={{ originX: 0 }}
                  />
                </div>

                <motion.div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentStep >= 2
                      ? "bg-white text-teal-600 shadow-lg"
                      : "bg-white/30 text-white"
                  }`}
                  animate={{ scale: currentStep === 2 ? 1.1 : 1 }}
                >
                  2
                </motion.div>
              </div>

              <div className="ml-6">
                <Badge 
                  variant="secondary" 
                  className="bg-white/20 text-white border-white/30 px-3 py-1"
                >
                  Step {currentStep} of 2
                </Badge>
              </div>
            </div>

            <div className="flex justify-between mt-3 text-sm text-blue-100">
              <span>Third Party Information</span>
              <span>Assignment Details</span>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {rifForm?.Sections?.[0]?.title || "Third Party Information"}
                      </h2>
                      {rifForm?.Sections?.[0]?.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {rifForm.Sections[0].description}
                        </p>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {rifForm?.Sections?.[0]?.Questions?.sort(
                      (a: Question, b: Question) => a.order - b.order
                    )?.map((question: Question, index: number) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-3"
                      >
                        <label className="block text-sm font-medium text-gray-900">
                          {question.questionText}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {renderQuestion(question)}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Section 1 Completed Successfully
                    </h4>
                    <p className="text-sm text-green-800 mt-1">
                      Third party information has been collected. Now assign the assessment to an internal user.
                    </p>
                  </div>
                </div>
              </motion.div>

              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Assignment Details</h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Assign this assessment to an internal team member for review
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        Full Name *
                      </label>
                      <Input
                        value={assignment.name}
                        onChange={(e) =>
                          setAssignment({ ...assignment, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={assignment.email}
                        onChange={(e) =>
                          setAssignment({ ...assignment, email: e.target.value })
                        }
                        placeholder="john.doe@company.com"
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        Department *
                      </label>
                      <select
                        value={assignment.department}
                        onChange={(e) =>
                          setAssignment({
                            ...assignment,
                            department: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select Department</option>
                        <option value="IT Security">IT Security</option>
                        <option value="Risk Management">Risk Management</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Legal">Legal</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Target className="w-4 h-4 mr-2 text-gray-400" />
                        Role *
                      </label>
                      <select
                        value={assignment.role}
                        onChange={(e) =>
                          setAssignment({ ...assignment, role: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select Role</option>
                        <option value="Security Manager">Security Manager</option>
                        <option value="Risk Analyst">Risk Analyst</option>
                        <option value="Compliance Officer">Compliance Officer</option>
                        <option value="Senior Analyst">Senior Analyst</option>
                        <option value="Team Lead">Team Lead</option>
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        Due Date *
                      </label>
                      <Input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={assignment.dueDate}
                        onChange={(e) =>
                          setAssignment({
                            ...assignment,
                            dueDate: e.target.value,
                          })
                        }
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="md:col-span-2 space-y-2"
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        Assignment Comments
                      </label>
                      <textarea
                        value={assignment.comments}
                        onChange={(e) =>
                          setAssignment({
                            ...assignment,
                            comments: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Additional instructions or context for the assignee..."
                      />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        >
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="border-gray-300 hover:border-teal-500 hover:bg-teal-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!isSection1Complete()}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                Continue to Assignment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={!isAssignmentComplete() || initiateRifMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                {initiateRifMutation.isPending && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                )}
                Assign RIF Assessment
                <Send className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RifCreationForm;