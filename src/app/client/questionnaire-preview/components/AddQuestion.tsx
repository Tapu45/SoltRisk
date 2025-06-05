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
  X,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionFormState, Template } from '../../../../types/reuslt.type';

// Updated question types to match Prisma schema
const QuestionTypes = [
  { value: "TEXT", label: "Text Input" },
  { value: "TEXTAREA", label: "Text Area" },
  { value: "BOOLEAN", label: "Yes/No" },
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "SCALE", label: "Scale (1-10)" },
  { value: "FILE_UPLOAD", label: "File Upload" },
  { value: "DATE", label: "Date" },
  { value: "NUMBER", label: "Number" },
];

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionForm: QuestionFormState;
  setQuestionForm: (form: QuestionFormState) => void;
  selectedTemplate: Template | null;
  onAddQuestion: (updatedForm?: QuestionFormState) => void;
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
  // State for conditional text settings
  const [conditionalSettings, setConditionalSettings] = React.useState({
    enableConditional: false,
    triggerValues: [] as string[],
    conditionalPrompt: ""
  });

  // State to track if user wants conditional logic
  const [wantsConditional, setWantsConditional] = React.useState(false);

  // Reset conditional settings when question type changes
  React.useEffect(() => {
    setConditionalSettings({
      enableConditional: false,
      triggerValues: [],
      conditionalPrompt: ""
    });
    setWantsConditional(false);
  }, [questionForm.questionType]);

  // Handle adding new option
  const addOption = () => {
    const currentOptions = questionForm.options || [];
    setQuestionForm({
      ...questionForm,
      options: [...currentOptions, ""]
    });
  };

  // Handle removing option
  const removeOption = (index: number) => {
    const currentOptions = questionForm.options || [];
    const optionToRemove = currentOptions[index];
    
    // Remove from conditional triggers if it exists
    if (conditionalSettings.triggerValues.includes(optionToRemove)) {
      setConditionalSettings({
        ...conditionalSettings,
        triggerValues: conditionalSettings.triggerValues.filter(val => val !== optionToRemove)
      });
    }
    
    setQuestionForm({
      ...questionForm,
      options: currentOptions.filter((_: any, i: number) => i !== index)
    });
  };

  // Handle option text change
  const updateOption = (index: number, value: string) => {
    const currentOptions = questionForm.options || [];
    const oldValue = currentOptions[index];
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = value;
    
    // Update conditional triggers if the old value was selected
    if (conditionalSettings.triggerValues.includes(oldValue)) {
      const updatedTriggers = conditionalSettings.triggerValues.map(trigger => 
        trigger === oldValue ? value : trigger
      );
      setConditionalSettings({
        ...conditionalSettings,
        triggerValues: updatedTriggers
      });
    }
    
    setQuestionForm({
      ...questionForm,
      options: updatedOptions
    });
  };

  // Handle question type change
  const handleQuestionTypeChange = (value: string) => {
    const needsOptions = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(value);
    
    setQuestionForm({
      ...questionForm,
      questionType: value,
      options: needsOptions ? [""] : null
    });
  };

  // Handle conditional trigger change for boolean questions
  const handleBooleanTriggerChange = (value: string) => {
    setConditionalSettings({
      ...conditionalSettings,
      triggerValues: [value]
    });
  };

  // Handle conditional trigger change for choice questions
  const handleChoiceTriggerChange = (option: string, checked: boolean) => {
    if (checked) {
      setConditionalSettings({
        ...conditionalSettings,
        triggerValues: [...conditionalSettings.triggerValues, option]
      });
    } else {
      setConditionalSettings({
        ...conditionalSettings,
        triggerValues: conditionalSettings.triggerValues.filter(val => val !== option)
      });
    }
  };

  // Handle add question with conditional logic
  const handleAddQuestion = () => {
    let questionOptions: any = null;
    const needsOptions = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(questionForm.questionType);

    if (needsOptions) {
      // For choice questions with options
      questionOptions = {
        choices: questionForm.options?.map((option: string) => ({
          value: option,
          requiresText: wantsConditional && conditionalSettings.triggerValues.includes(option)
        }))
      };

      // Add conditional text configuration if enabled
      if (wantsConditional && conditionalSettings.conditionalPrompt && conditionalSettings.triggerValues.length > 0) {
        questionOptions.conditionalText = {
          trigger: conditionalSettings.triggerValues,
          prompt: conditionalSettings.conditionalPrompt
        };
      }
    } else if (questionForm.questionType === "BOOLEAN" && wantsConditional) {
      // For Yes/No questions with conditional text (following seed file pattern)
      questionOptions = {
        choices: [
          { 
            value: 'Yes', 
            requiresText: conditionalSettings.triggerValues.includes('Yes') 
          },
          { 
            value: 'No', 
            requiresText: conditionalSettings.triggerValues.includes('No') 
          }
        ]
      };

      if (conditionalSettings.conditionalPrompt) {
        questionOptions.conditionalText = {
          trigger: conditionalSettings.triggerValues[0] || 'Yes',
          prompt: conditionalSettings.conditionalPrompt
        };
      }
    }

    // Update the question form with the options
    const updatedQuestionForm = {
      ...questionForm,
      options: questionOptions
    };

    // Call the original onAddQuestion with updated form
    onAddQuestion(updatedQuestionForm);
  };

  // Check if question type can have conditional logic
  const canHaveConditional = ["BOOLEAN", "SINGLE_CHOICE"].includes(questionForm.questionType);
  const needsOptions = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(questionForm.questionType);

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

            {/* Question Type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-violet-500" />
                <Label className="text-lg font-semibold text-slate-800">Question Type *</Label>
              </div>
              <Select
                value={questionForm.questionType}
                onValueChange={handleQuestionTypeChange}
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
            </motion.div>

            {/* Conditional Logic Toggle */}
            <AnimatePresence>
              {canHaveConditional && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="enable-conditional"
                      checked={wantsConditional}
                      onCheckedChange={(checked) => {
                        setWantsConditional(checked as boolean);
                        if (!checked) {
                          setConditionalSettings({
                            enableConditional: false,
                            triggerValues: [],
                            conditionalPrompt: ""
                          });
                        } else if (questionForm.questionType === "BOOLEAN") {
                          setConditionalSettings(prev => ({
                            ...prev,
                            triggerValues: ["Yes"]
                          }));
                        }
                      }}
                      className="border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor="enable-conditional" className="text-base font-medium text-slate-700">
                      Add conditional text input for this question
                    </Label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options for Choice Questions */}
            <AnimatePresence>
              {needsOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <Label className="text-lg font-semibold text-slate-800">
                      Answer Options *
                    </Label>
                  </div>
                  <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                    {questionForm.options?.map((option: string | number | readonly string[] | undefined, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600 w-8">
                          {index + 1}.
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg"
                        />
                        {questionForm.options && questionForm.options.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeOption(index)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conditional Logic Settings */}
            <AnimatePresence>
              {canHaveConditional && wantsConditional && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    <Label className="text-lg font-semibold text-slate-800">
                      Conditional Logic Settings
                    </Label>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-xl border border-blue-200/60 space-y-4">
                    {questionForm.questionType === "BOOLEAN" && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">
                          Which response should trigger additional text input? *
                        </Label>
                        <RadioGroup
                          value={conditionalSettings.triggerValues[0] || "Yes"}
                          onValueChange={handleBooleanTriggerChange}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="Yes" id="trigger-yes" />
                            <Label htmlFor="trigger-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="No" id="trigger-no" />
                            <Label htmlFor="trigger-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {questionForm.questionType === "SINGLE_CHOICE" && questionForm.options && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">
                          Which options should trigger additional text input? *
                        </Label>
                        <div className="space-y-2">
                          {questionForm.options.map((option: string, index: number) => (
                            option && (
                              <div key={index} className="flex items-center space-x-3">
                                <Checkbox
                                  id={`trigger-${index}`}
                                  checked={conditionalSettings.triggerValues.includes(option)}
                                  onCheckedChange={(checked) => handleChoiceTriggerChange(option, checked as boolean)}
                                />
                                <Label htmlFor={`trigger-${index}`} className="text-sm">
                                  {option}
                                </Label>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="conditional-prompt" className="text-sm font-medium text-slate-700">
                        Prompt for additional text input *
                      </Label>
                      <Input
                        id="conditional-prompt"
                        value={conditionalSettings.conditionalPrompt}
                        onChange={(e) => 
                          setConditionalSettings({
                            ...conditionalSettings,
                            conditionalPrompt: e.target.value
                          })
                        }
                        placeholder="e.g., Please provide the name of your parent company:"
                        className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg"
                      />
                    </div>

                    {/* Preview of conditional logic */}
                    {conditionalSettings.conditionalPrompt && conditionalSettings.triggerValues.length > 0 && (
                      <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                        <Label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Preview</Label>
                        <p className="text-sm text-slate-600 mt-1">
                          When user selects "{conditionalSettings.triggerValues.join('" or "')}", 
                          they will see: <span className="font-medium">"{conditionalSettings.conditionalPrompt}"</span>
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question Options */}
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
                onClick={handleAddQuestion}
                disabled={
                  isLoading ||
                  !questionForm.questionText.trim() ||
                  (!questionForm.createNewSection && !questionForm.sectionId) ||
                  (questionForm.createNewSection && !questionForm.newSectionTitle.trim()) ||
                  (needsOptions && (!questionForm.options || questionForm.options.length === 0 || questionForm.options.some((opt: string) => !opt.trim()))) ||
                  (wantsConditional && (!conditionalSettings.conditionalPrompt.trim() || conditionalSettings.triggerValues.length === 0))
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