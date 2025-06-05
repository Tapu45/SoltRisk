"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Mail, FileText, Send, Settings, Eye, Clock, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FloatingParticles from "@/components/animation/floatingparticles";

// Import types and utilities
import { Template, SubmissionData } from '../../../../types/reuslt.type';
import { useQuestionnaireHandlers } from '../components/handler';
import { getRiskColor, getCurrentUser } from '../components/utility';
import { AddQuestionDialog } from '../components/AddQuestion';
import { QuestionnaireSection } from '../components/section';

export default function QuestionnairePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;
  const [currentUser] = useState(getCurrentUser());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch submission data
  const { data: submissionData, isLoading: submissionLoading } = useQuery<SubmissionData>({
    queryKey: ["submission-details", submissionId],
    queryFn: async () => {
      const response = await fetch(`/api/client/vendor?action=submission-details&submissionId=${submissionId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch submission details")
      }
      return response.json()
    },
    enabled: !!submissionId,
  });

  // Fetch questionnaire template based on risk level
  const { data: templateData, isLoading: templateLoading } = useQuery<{
    template: Template;
  }>({
    queryKey: ["template-by-risk", submissionData?.riskAssessment?.riskLevel],
    queryFn: async () => {
      const riskLevel = submissionData?.riskAssessment?.riskLevel;
      const templates = await fetch("/api/vendor?action=templates-list").then(
        (res) => res.json()
      );

      const template = templates.templates.find(
        (t: any) => t.riskLevel === riskLevel && t.isActive
      );

      if (!template) {
        throw new Error(`No template found for ${riskLevel} risk level`);
      }

      const templateStructure = await fetch(
        `/api/vendor?action=template-structure&templateId=${template.id}`
      ).then((res) => res.json());

      return templateStructure;
    },
    enabled: !!submissionData?.riskAssessment?.riskLevel,
  });

  // Use handlers hook
  const {
    questionForm,
    setQuestionForm,
    showAddQuestion,
    setShowAddQuestion,
    expandedSections,
    setExpandedSections,
    editingQuestion,
    setEditingQuestion,
    sendInvitationMutation,
    addQuestionMutation,
    handleAddQuestion,
    handleDeleteQuestion,
    handleSendInvitation,
    resetQuestionForm,
    toggleSection,
  } = useQuestionnaireHandlers({
    submissionId,
    currentUser,
    selectedTemplate,
    submissionData: submissionData ?? null
  });

  // Set template when data loads
  useEffect(() => {
    if (templateData?.template) {
      setSelectedTemplate(templateData.template);
      // Expand all sections by default
      setExpandedSections(
        new Set(templateData.template.sections.map((s) => s.id))
      );
    }
  }, [templateData, setExpandedSections]);

  const handleAddQuestionToSection = (sectionId: string) => {
    setQuestionForm({
      ...questionForm,
      sectionId: sectionId,
      createNewSection: false,
    });
    setShowAddQuestion(true);
  };

  const handleCancelAddQuestion = () => {
    setShowAddQuestion(false);
    resetQuestionForm();
  };

  if (submissionLoading || templateLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/30 relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full mx-auto mb-6 shadow-lg"
            />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Loading Questionnaire Preview
            </h2>
            <p className="text-slate-600">
              Preparing questionnaire for {submissionData?.vendor?.name}...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!submissionData || !selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/50 to-pink-50/30 relative overflow-hidden">
        <FloatingParticles />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto p-6"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-700 mb-3">
              Error Loading Preview
            </h1>
            <p className="text-red-600 mb-6">
              Failed to load questionnaire preview. Please try again.
            </p>
            <Button onClick={() => window.close()} variant="outline" className="border-red-200 hover:border-red-300 hover:bg-red-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Close Preview
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/30 relative overflow-hidden">
      <FloatingParticles />

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Back Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="self-start"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.close()}
                className="bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:border-indigo-300 hover:bg-indigo-50/80 shadow-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-slate-600" />
                <span className="text-slate-700">Close Preview</span>
              </Button>
            </motion.div>

            {/* Main Header Content */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl shadow-indigo-500/10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 bg-clip-text text-transparent mb-2">
                      Questionnaire Setup
                    </h1>
                    <p className="text-slate-600 text-lg mb-3">
                      Review and customize questionnaire for <span className="font-semibold text-slate-800">{submissionData.vendor.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-lg">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">{submissionData.vendor.email}</span>
                      </div>
                      <Badge
                        className={`px-3 py-1.5 text-sm font-semibold border-2 shadow-sm ${getRiskColor(
                          submissionData.riskAssessment.riskLevel
                        )}`}
                      >
                        {submissionData.riskAssessment.riskLevel} Risk
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="lg:self-start"
                >
                  <Button
                    onClick={handleSendInvitation}
                    disabled={sendInvitationMutation.isPending || !selectedTemplate}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 text-white border-0 px-6 py-3 font-semibold rounded-xl transition-all duration-300"
                  >
                    {sendInvitationMutation.isPending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Questionnaire
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Preview & Customize</h3>
                  <p className="text-blue-700 text-sm">
                    Review the {selectedTemplate?.riskLevel || 'MEDIUM'} risk questionnaire template, add or remove questions as needed, then send to the vendor.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.header>

          

          {/* Template Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-500/10 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-violet-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-3 text-xl mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-slate-800">Questionnaire Sections</span>
                    </CardTitle>
                    <p className="text-slate-600">
                      Review and customize questions before sending
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <AddQuestionDialog
                      open={showAddQuestion}
                      onOpenChange={setShowAddQuestion}
                      questionForm={questionForm}
                      setQuestionForm={setQuestionForm}
                      selectedTemplate={selectedTemplate}
                      onAddQuestion={handleAddQuestion}
                      onCancel={handleCancelAddQuestion}
                      isLoading={addQuestionMutation.isPending}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {selectedTemplate.sections.map((section) => (
                    <QuestionnaireSection
                      key={section.id}
                      section={section}
                      isExpanded={expandedSections.has(section.id)}
                      onToggle={toggleSection}
                      onDeleteQuestion={handleDeleteQuestion}
                      onEditQuestion={setEditingQuestion}
                      onAddQuestionToSection={handleAddQuestionToSection}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Footer Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/40">
              <div className="flex items-center justify-between gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <Hash className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {selectedTemplate.totalQuestions}
                  </div>
                  <div className="text-xs font-medium text-slate-600">Total Questions</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <FileText className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {selectedTemplate.sections.length}
                  </div>
                  <div className="text-xs font-medium text-slate-600">Sections</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    ~{selectedTemplate.estimatedTime}
                  </div>
                  <div className="text-xs font-medium text-slate-600">Minutes</div>
                </div>
                
                <div className="pl-6 border-l border-slate-200">
                  <Button
                    onClick={handleSendInvitation}
                    disabled={sendInvitationMutation.isPending || !selectedTemplate}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 text-white px-6 py-3 font-semibold rounded-xl transition-all duration-300"
                  >
                    {sendInvitationMutation.isPending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Questionnaire
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}