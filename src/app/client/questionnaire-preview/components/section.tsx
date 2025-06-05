import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Plus, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Target,
  MessageSquare,
  Layers,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, QuestionFormState, QuestionTypes } from '../../../../types/reuslt.type';
import { getQuestionTypeIcon } from './utility';

interface QuestionnaireSectionProps {
  section: Section;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onEditQuestion: (question: any) => void;
  onAddQuestionToSection: (sectionId: string) => void;
}

export const QuestionnaireSection: React.FC<QuestionnaireSectionProps> = ({
  section,
  isExpanded,
  onToggle,
  onDeleteQuestion,
  onEditQuestion,
  onAddQuestionToSection
}) => {
  const getSectionIcon = () => {
    if (section.title.toLowerCase().includes('security')) return '🛡️';
    if (section.title.toLowerCase().includes('compliance')) return '📋';
    if (section.title.toLowerCase().includes('data')) return '💾';
    if (section.title.toLowerCase().includes('financial')) return '💰';
    if (section.title.toLowerCase().includes('technical')) return '⚙️';
    if (section.title.toLowerCase().includes('operational')) return '🏢';
    return '📝';
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-3"
  >
    <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-lg shadow-indigo-500/8 rounded-xl overflow-hidden border-l-4 border-l-indigo-500">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-50/90 to-indigo-50/60 border-b border-indigo-100/30">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={() => onToggle(section.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-white" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-white" />
                  )}
                </motion.div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-xs shadow-sm">
                <span className="text-white font-bold text-xs">{section.questionCount}</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getSectionIcon()}</span>
                <h3 className="font-bold text-slate-800 text-lg">{section.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100/60 rounded-full text-indigo-700">
                  <MessageSquare className="w-3 h-3" />
                  <span className="font-medium">{section.questionCount} questions</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-violet-100/60 rounded-full text-violet-700">
                  <Layers className="w-3 h-3" />
                  <span className="font-medium">Section {section.order}</span>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm text-xs px-2 py-0.5">
                  <Zap className="w-2 h-2 mr-1" />
                  Weight: {section.weightage}
                </Badge>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddQuestionToSection(section.id)}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 shadow-sm hover:shadow-md transition-all duration-300 text-xs px-3 py-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Question
            </Button>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {section.description && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-lg border border-blue-200/50 shadow-sm"
            >
              <p className="text-xs text-blue-800 leading-relaxed">
                {section.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="pt-0 pb-4 bg-gradient-to-b from-white/50 to-slate-50/30">
              <div className="space-y-3 mt-3">
                {section.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 hover:shadow-md hover:border-indigo-300/60 hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2 min-w-[60px]">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 flex items-center justify-center border border-indigo-200/60 shadow-sm">
                            <span className="text-indigo-600 font-bold text-sm">
                              {getQuestionTypeIcon(question.questionType)}
                            </span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">{question.order}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <Target className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <p className="font-semibold text-slate-800 leading-relaxed">
                            {question.questionText}
                          </p>
                        </div>
                        
                        {question.description && (
                          <div className="flex items-start gap-2 mb-3 ml-6">
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-2 rounded-lg border border-slate-200/40">
                              {question.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center flex-wrap gap-1 ml-6">
                          <Badge 
                            variant="outline" 
                            className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300 text-slate-700 font-medium shadow-sm text-xs px-2 py-0.5"
                          >
                            {QuestionTypes.find((t) => t.value === question.questionType)?.label}
                          </Badge>
                          
                          {question.isRequired && (
                            <Badge className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-700 shadow-sm text-xs px-2 py-0.5">
                              <AlertCircle className="w-2 h-2 mr-1" />
                              Required
                            </Badge>
                          )}
                          
                          {question.evidenceRequired && (
                            <Badge className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700 shadow-sm text-xs px-2 py-0.5">
                              <FileText className="w-2 h-2 mr-1" />
                              Evidence
                            </Badge>
                          )}
                          
                          {question.category && (
                            <Badge 
                              variant="outline" 
                              className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 text-blue-700 shadow-sm text-xs px-2 py-0.5"
                            >
                              {question.category}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditQuestion(question)}
                            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteQuestion(question.id)}
                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {section.questions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30 rounded-xl border-2 border-dashed border-slate-300/60"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FileText className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-2">No questions added yet</h4>
                    <p className="text-slate-600 mb-4 max-w-sm mx-auto">
                      This section is ready for content. Add your first question to get started.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="bg-gradient-to-r from-white to-indigo-50 border-indigo-200 hover:from-indigo-50 hover:to-indigo-100 text-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => onAddQuestionToSection(section.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Question
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  </motion.div>
);
};