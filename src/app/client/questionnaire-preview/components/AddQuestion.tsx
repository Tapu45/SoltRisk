import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  Settings, 
  Target,
  Layers,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionTypes, QuestionFormState, Template } from '../../../../types/reuslt.type';

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionForm: QuestionFormState;
  setQuestionForm: (form: QuestionFormState) => void;
  selectedTemplate: Template | null;
  onAddQuestion: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const AddQuestionDialog: React.FC<AddQuestionDialogProps> = ({
  open,
  onOpenChange,
  questionForm,
  setQuestionForm,
  selectedTemplate,
  onAddQuestion,
  onCancel,
  isLoading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/30 text-white border-0 rounded-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-indigo-500/20 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="pb-6 border-b border-indigo-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent">
                  Add New Question
                </DialogTitle>
                <DialogDescription className="text-slate-600 text-lg">
                  Create a new question for your questionnaire template
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            {/* Question Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                <Label htmlFor="question-text" className="text-lg font-semibold text-slate-800">
                  Question Text *
                </Label>
              </div>
              <Textarea
                id="question-text"
                value={questionForm.questionText}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    questionText: e.target.value,
                  })
                }
                placeholder="Enter your question here..."
                className="min-h-[100px] bg-white/80 backdrop-blur-sm border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl shadow-sm text-base"
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                <Label htmlFor="question-desc" className="text-lg font-semibold text-slate-800">
                  Description
                </Label>
                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Optional</span>
              </div>
              <Textarea
                id="question-desc"
                value={questionForm.description}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    description: e.target.value,
                  })
                }
                placeholder="Additional context or guidance for this question..."
                className="bg-white/80 backdrop-blur-sm border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl shadow-sm"
              />
            </motion.div>

            {/* Type and Category */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-violet-500" />
                  <Label className="text-lg font-semibold text-slate-800">Question Type *</Label>
                </div>
                <Select
                  value={questionForm.questionType}
                  onValueChange={(value) =>
                    setQuestionForm({
                      ...questionForm,
                      questionType: value,
                    })
                  }
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200 focus:border-indigo-400 rounded-xl shadow-sm">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-200 rounded-xl shadow-xl">
                    {QuestionTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="focus:bg-indigo-50 focus:text-indigo-900 rounded-lg"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <Label htmlFor="category" className="text-lg font-semibold text-slate-800">Category</Label>
                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Optional</span>
                </div>
                <Input
                  id="category"
                  value={questionForm.category}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g., Technical, Policy, Security"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl shadow-sm"
                />
              </div>
            </motion.div>

            {/* Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Label className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Question Options
              </Label>
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 p-4 rounded-xl border border-slate-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="required"
                      checked={questionForm.isRequired}
                      onCheckedChange={(checked) =>
                        setQuestionForm({
                          ...questionForm,
                          isRequired: checked as boolean,
                        })
                      }
                      className="border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <Label htmlFor="required" className="text-base font-medium text-slate-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Required Field
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="evidence"
                      checked={questionForm.evidenceRequired}
                      onCheckedChange={(checked) =>
                        setQuestionForm({
                          ...questionForm,
                          evidenceRequired: checked as boolean,
                        })
                      }
                      className="border-amber-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <Label htmlFor="evidence" className="text-base font-medium text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      Evidence Required
                    </Label>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <Label className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Section Placement
              </Label>
              <RadioGroup
                value={questionForm.createNewSection ? "new" : "existing"}
                onValueChange={(value) =>
                  setQuestionForm({
                    ...questionForm,
                    createNewSection: value === "new",
                  })
                }
                className="space-y-4"
              >
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="existing" id="existing-section" className="border-indigo-300 text-indigo-600" />
                    <Label htmlFor="existing-section" className="text-base font-medium text-slate-700">
                      Add to existing section
                    </Label>
                  </div>
                  <AnimatePresence>
                    {!questionForm.createNewSection && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3"
                      >
                        <Select
                          value={questionForm.sectionId}
                          onValueChange={(value) =>
                            setQuestionForm({
                              ...questionForm,
                              sectionId: value,
                            })
                          }
                        >
                          <SelectTrigger className="bg-white border-slate-200 focus:border-indigo-400 rounded-lg">
                            <SelectValue placeholder="Select a section" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-200 rounded-xl shadow-xl">
                            {selectedTemplate?.sections.map((section) => (
                              <SelectItem 
                                key={section.id} 
                                value={section.id}
                                className="focus:bg-indigo-50 focus:text-indigo-900 rounded-lg"
                              >
                                {section.title} ({section.questionCount} questions)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="new" id="new-section" className="border-indigo-300 text-indigo-600" />
                    <Label htmlFor="new-section" className="text-base font-medium text-slate-700">
                      Create new section
                    </Label>
                  </div>
                  <AnimatePresence>
                    {questionForm.createNewSection && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 space-y-3"
                      >
                        <Input
                          value={questionForm.newSectionTitle}
                          onChange={(e) =>
                            setQuestionForm({
                              ...questionForm,
                              newSectionTitle: e.target.value,
                            })
                          }
                          placeholder="New section title"
                          className="bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg"
                        />
                        <Textarea
                          value={questionForm.newSectionDescription}
                          onChange={(e) =>
                            setQuestionForm({
                              ...questionForm,
                              newSectionDescription: e.target.value,
                            })
                          }
                          placeholder="Section description (optional)"
                          className="bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RadioGroup>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end space-x-3 pt-6 border-t border-slate-200/60"
            >
              <Button 
                onClick={onCancel} 
                variant="outline"
                className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl px-6 py-2 shadow-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={onAddQuestion}
                disabled={
                  isLoading ||
                  !questionForm.questionText.trim() ||
                  (!questionForm.createNewSection && !questionForm.sectionId) ||
                  (questionForm.createNewSection && !questionForm.newSectionTitle.trim())
                }
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/30 text-white border-0 rounded-xl px-6 py-2 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};