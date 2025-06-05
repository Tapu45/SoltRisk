import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  QuestionFormState, 
  SectionFormState, 
  Template,
  SubmissionData 
} from '../../../../types/reuslt.type';

interface UseQuestionnaireHandlersProps {
  submissionId: string;
  currentUser: any;
  selectedTemplate: Template | null;
  submissionData: SubmissionData | null;
}

export const useQuestionnaireHandlers = ({
  submissionId,
  currentUser,
  selectedTemplate,
  submissionData
}: UseQuestionnaireHandlersProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form states
  const [questionForm, setQuestionForm] = useState<QuestionFormState>({
    questionText: "",
    description: "",
    questionType: "TEXT",
    isRequired: true,
    evidenceRequired: false,
    category: "",
    sectionId: "",
    createNewSection: false,
    newSectionTitle: "",
    newSectionDescription: "",
    options: null,
  });

  const [sectionForm, setSectionForm] = useState<SectionFormState>({
    title: "",
    description: "",
    weightage: 1.0,
    isRequired: true,
  });

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async ({ templateId }: { templateId: string }) => {
      const response = await fetch("/api/vendor/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rifSubmissionId: submissionId,
          clientId: currentUser?.id,
          templateId: templateId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Questionnaire Invitation Sent!</div>
          <div className="text-sm text-gray-600">
            Email sent to {data.vendorEmail} for {data.riskLevel} risk assessment
          </div>
        </div>
      );
      // Close the tab and refresh parent window
      window.opener?.postMessage({ type: 'questionnaire-sent', data }, '*');
      setTimeout(() => {
        window.close();
      }, 2000);
    },
    onError: (error: any) => {
      if (error.message.includes('already sent')) {
        toast.warning(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Invitation Already Sent</div>
            <div className="text-sm text-gray-600">
              A questionnaire invitation has already been sent for this assessment
            </div>
          </div>
        );
      } else {
        toast.error(error.message || 'Failed to send invitation');
      }
    },
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch("/api/vendor?action=add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add question");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Question added successfully");
      setShowAddQuestion(false);
      resetQuestionForm();
      // Refresh template data
      queryClient.invalidateQueries({
        queryKey: [
          "template-by-risk",
          submissionData?.riskAssessment?.riskLevel,
        ],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add question");
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch("/api/vendor?action=delete-question", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          templateId: selectedTemplate?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete question");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.sectionDeleted) {
        toast.info(
          `Section "${data.deletedSection}" was automatically removed`
        );
      }
      // Refresh template data
      queryClient.invalidateQueries({
        queryKey: [
          "template-by-risk",
          submissionData?.riskAssessment?.riskLevel,
        ],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete question");
    },
  });

  // Handlers
  const handleAddQuestion = () => {
    if (!selectedTemplate || !questionForm.questionText.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload: any = {
      templateId: selectedTemplate.id,
      questionData: {
        questionText: questionForm.questionText,
        description: questionForm.description || null,
        questionType: questionForm.questionType,
        isRequired: questionForm.isRequired,
        evidenceRequired: questionForm.evidenceRequired,
        category: questionForm.category || null,
        options: questionForm.options,
      },
    };

    if (questionForm.createNewSection) {
      payload.newSectionData = {
        title: questionForm.newSectionTitle,
        description: questionForm.newSectionDescription || null,
        weightage: 1.0,
        isRequired: true,
      };
    } else {
      payload.sectionId = questionForm.sectionId;
    }

    addQuestionMutation.mutate(payload);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }
    deleteQuestionMutation.mutate(questionId);
  };

  const handleSendInvitation = () => {
    if (!selectedTemplate) {
      toast.error("No template selected");
      return;
    }
    
    // Show confirmation before sending
    if (confirm(`Send questionnaire with ${selectedTemplate.totalQuestions} questions to ${submissionData?.vendor.name}?`)) {
      sendInvitationMutation.mutate({ templateId: selectedTemplate.id });
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: "",
      description: "",
      questionType: "TEXT",
      isRequired: true,
      evidenceRequired: false,
      category: "",
      sectionId: "",
      createNewSection: false,
      newSectionTitle: "",
      newSectionDescription: "",
      options: null,
    });
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return {
    // State
    questionForm,
    setQuestionForm,
    sectionForm,
    setSectionForm,
    showAddQuestion,
    setShowAddQuestion,
    editingQuestion,
    setEditingQuestion,
    showAddSection,
    setShowAddSection,
    expandedSections,
    setExpandedSections,

    // Mutations
    sendInvitationMutation,
    addQuestionMutation,
    deleteQuestionMutation,

    // Handlers
    handleAddQuestion,
    handleDeleteQuestion,
    handleSendInvitation,
    resetQuestionForm,
    toggleSection,
  };
};