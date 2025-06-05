export const getQuestionTypeIcon = (type: string): string => {
  switch (type) {
    case "BOOLEAN":
      return "✓";
    case "SINGLE_CHOICE":
      return "◉";
    case "MULTIPLE_CHOICE":
      return "☑";
    case "SCALE":
      return "★";
    case "FILE_UPLOAD":
      return "📎";
    case "DATE":
      return "📅";
    case "NUMBER":
      return "#";
    default:
      return "T";
  }
};

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel?.toLowerCase()) {
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }
  return null;
};