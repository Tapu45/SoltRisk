"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Building,
  Zap,
  Save,
  Send,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Target,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Import our components
import { useQuestionnaire } from "../components/questionarieshandlers";
import { QuestionRenderer } from "../components/question-render";
import FloatingParticles from "../../../../components/animation/floatingparticles";

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.questionnaireId as string;

  const {
    loading,
    submitting,
    questionnaireData,
    responses,
    progress,
    validationErrors,
    currentSectionIndex,
    error,
    updateResponse,
    goToSection,
    nextSection,
    prevSection,
    startQuestionnaire,
    submitQuestionnaire,
    loadQuestionnaire,
    uploadFile,
    currentSection,
    isFirstSection,
    isLastSection,
    canSubmit,
    isCompleted,
    savingQuestionId,
    lastSavedTime,
  } = useQuestionnaire(questionnaireId);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen"
        >
          <Card className="p-8 max-w-md mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6"
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Loading Questionnaire
              </h2>
              <p className="text-gray-600">
                Please wait while we prepare your assessment...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 relative overflow-hidden">
        <FloatingParticles />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-bold text-red-700 mb-4">
              Access Error
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => loadQuestionnaire()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/vendor/dashboard")}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!questionnaireData) return null;

  const { questionnaire, template, vendor, client } = questionnaireData;

  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Not started state
  if (questionnaire.status === "NOT_STARTED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
        <FloatingParticles />

        {/* Header */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-8 py-12 text-white">
                <div className="flex items-center gap-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center"
                  >
                    <Shield className="w-10 h-10" />
                  </motion.div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
                    <p className="text-blue-100 text-lg">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Target className="w-3 h-3 mr-1" />
                        {template.riskLevel} Risk
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Est. {template.estimatedTime} minutes
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30">
                        <FileText className="w-3 h-3 mr-1" />
                        {questionnaire.totalQuestions} questions
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                {/* Client Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Assessment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-600">
                        Client
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {client.name || "Unknown Client"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-600">
                        Due Date
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {new Date(questionnaire.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-600">
                        Assigned Date
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {new Date(
                          questionnaire.assignedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-600">
                        Sections
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {template.sections.length} sections
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Overview */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Assessment Sections
                  </h3>
                  <div className="space-y-3">
                    {template.sections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {section.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {section.questions.length} questions
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Important Instructions
                  </h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>
                        Answer all required questions to complete the assessment
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>
                        Your responses are automatically saved as you type
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Upload evidence files where required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>
                        You can save progress and return later before final
                        submission
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Start Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={startQuestionnaire}
                      size="lg"
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-xl px-12 py-4 text-lg"
                    >
                      <PlayCircle className="w-6 h-6 mr-3" />
                      Start Assessment
                    </Button>
                  </motion.div>
                  <p className="text-sm text-gray-600 mt-3">
                    Ready to begin? Click above to start your assessment.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 relative overflow-hidden">
        <FloatingParticles />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/vendor/dashboard")}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <CheckCircle className="w-32 h-32 text-green-500 mx-auto mb-8" />
            </motion.div>

            <h1 className="text-4xl font-bold text-green-700 mb-4">
              Assessment Completed!
            </h1>
            <p className="text-xl text-green-600 mb-8">
              Your questionnaire has been successfully submitted for review.
            </p>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-900">Submitted</h3>
                    <p className="text-sm text-green-700">
                      {questionnaire.submittedAt &&
                        new Date(questionnaire.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-900">Completion</h3>
                    <p className="text-sm text-blue-700">
                      {questionnaire.answeredQuestions} /{" "}
                      {questionnaire.totalQuestions} questions
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    What happens next?
                  </h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">
                          1
                        </span>
                      </div>
                      <span className="text-gray-700">
                        Client review of your responses
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">
                          2
                        </span>
                      </div>
                      <span className="text-gray-700">
                        Risk assessment calculation
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">
                          3
                        </span>
                      </div>
                      <span className="text-gray-700">
                        Final approval notification
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Button
                onClick={() => router.push("/vendor/dashboard")}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                <Home className="w-5 h-5 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main questionnaire interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
      <FloatingParticles />

      {/* Header */}
     {/* Header */}
<motion.header
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white/90 backdrop-blur-md  border-b border-white/20 sticky top-0 z-50"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between py-4">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/vendor/dashboard')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </motion.div>
        
        <div className="h-8 w-px bg-gradient-to-b from-teal-400 to-blue-400"></div>
        
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            {template.name}
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 font-medium">{client.name}</span>
            
            {/* Last Saved Indicator */}
            {lastSavedTime && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full border border-green-200"
              >
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs font-medium">
                  Saved {formatLastSaved(lastSavedTime)}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Auto-saving indicator */}
        {savingQuestionId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 rounded-full border border-blue-200"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">Auto-saving...</span>
          </motion.div>
        )}
        
        {/* Section indicator */}
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="text-xs bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200 text-teal-700 font-medium"
          >
            <Clock className="w-3 h-3 mr-1" />
            Section {currentSectionIndex + 1} of {template.sections.length}
          </Badge>
          
          {/* Progress indicator */}
          {progress && (
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(progress.progressPercentage)}%
              </span>
              <div className="relative">
                <Progress 
                  value={progress.progressPercentage} 
                  className="w-24 h-2"
                />
                <div 
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Progress */}
                {progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall</span>
                      <span>{Math.round(progress.progressPercentage)}%</span>
                    </div>
                    <Progress
                      value={progress.progressPercentage}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600">
                      {progress.answeredQuestions} of {progress.totalQuestions}{" "}
                      questions
                    </p>
                  </div>
                )}

                <Separator />

                {/* Section Navigation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Sections
                  </h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {template.sections.map((section, index) => {
                        const sectionProgress =
                          progress?.sectionProgress?.[section.id];
                        const isActive = index === currentSectionIndex;
                        const isCompleted = sectionProgress?.percentage === 100;

                        return (
                          <motion.button
                            key={section.id}
                            onClick={() => goToSection(index)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              isActive
                                ? "bg-teal-50 border-teal-200 shadow-sm"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isCompleted
                                    ? "bg-green-100 text-green-600"
                                    : isActive
                                    ? "bg-teal-100 text-teal-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isActive ? "text-teal-900" : "text-gray-900"
                                }`}
                              >
                                {section.title}
                              </span>
                            </div>
                            {sectionProgress && (
                              <div className="ml-8">
                                <Progress
                                  value={sectionProgress.percentage || 0}
                                  className="h-1 mb-1"
                                />
                                <p className="text-xs text-gray-600">
                                  {sectionProgress.answeredQuestions || 0} /{" "}
                                  {sectionProgress.totalQuestions || 0}
                                </p>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {currentSection && (
                <motion.div
                  key={currentSectionIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Section Header */}
                  <Card className="border-0 bg-gradient-to-r from-teal-600 to-blue-600 shadow-xl">
                    <CardContent className="p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">
                            {currentSection.title}
                          </h2>
                          <p className="text-blue-100">
                            {currentSection.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {currentSectionIndex + 1}
                          </div>
                          <div className="text-sm text-blue-100">
                            of {template.sections.length}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <Badge className="bg-white/20 text-white border-white/30">
                          {currentSection.questions.length} questions
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900">
                          Please complete the following required questions:
                        </h3>
                      </div>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error.message}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Questions */}
                  <div className="space-y-6">
                    {currentSection.questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <QuestionRenderer
                          question={question}
                          response={responses[question.id]}
                          validationError={validationErrors.find(
                            (e) => e.questionId === question.id
                          )}
                          onResponseChange={updateResponse}
                          onFileUpload={uploadFile}
                          savingQuestionId={savingQuestionId} // Add this line
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between pt-8"
                  >
                    <Button
                      onClick={prevSection}
                      disabled={isFirstSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous Section
                    </Button>

                    <div className="flex items-center gap-3">
                      {isLastSection ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={submitQuestionnaire}
                            disabled={submitting || !canSubmit}
                            size="lg"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5 mr-2" />
                                Submit Assessment
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ) : (
                        <Button
                          onClick={nextSection}
                          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                        >
                          Next Section
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
