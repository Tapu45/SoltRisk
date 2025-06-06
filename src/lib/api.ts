// Define the base URL for API endpoints
const BASE_URL = '/api';

// Define all API routes organized by feature
export const API_ROUTES = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    FORGET_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    VERIFY_CODE: `${BASE_URL}/auth/verify-code`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    SETUP_PASSWORD: `${BASE_URL}/auth/setup-password`,


    ORGANIZATION: `${BASE_URL}/organization`,
    
    // Role management endpoints
    CREATE_ROLE: `${BASE_URL}/auth/roles`,
    GET_ROLES: `${BASE_URL}/auth/roles`,
    GET_ROLE_BY_ID: (id: string) => `${BASE_URL}/auth/roles/${id}`,
    UPDATE_ROLE: (id: string) => `${BASE_URL}/auth/roles/${id}`,
    DELETE_ROLE: (id: string) => `${BASE_URL}/auth/roles/${id}`,
    
    // Permission management endpoints
    GET_PERMISSIONS: `${BASE_URL}/auth/permissions`,
    GET_PERMISSIONS_BY_ROLE: (roleName: string) => `${BASE_URL}/auth/permissions/${roleName}`,
    SYNC_PAGE_PERMISSIONS: `${BASE_URL}/auth/sync-page-permissions`,
  },

  USER: {
    PROFILE: `${BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${BASE_URL}/user/profile`,
    GET_BY_ID: (id: string) => `${BASE_URL}/user/${id}`,
    DELETE: (id: string) => `${BASE_URL}/user/${id}`,
  },

  CLIENT: {
    GET_ALL: `${BASE_URL}/clients`,
    GET_BY_ID: (id: string) => `${BASE_URL}/clients/${id}`,
    CREATE: `${BASE_URL}/clients`,
    UPDATE: (id: string) => `${BASE_URL}/clients/${id}`,
    DELETE: (id: string) => `${BASE_URL}/clients/${id}`,
    
    // Branch related
    GET_BRANCHES: (clientId: string) => `${BASE_URL}/clients/${clientId}/branches`,
    CREATE_BRANCH: (clientId: string) => `${BASE_URL}/clients/${clientId}/branches`,
    UPDATE_BRANCH: (clientId: string, branchId: string) => 
      `${BASE_URL}/clients/${clientId}/branches/${branchId}`,
    DELETE_BRANCH: (clientId: string, branchId: string) => 
      `${BASE_URL}/clients/${clientId}/branches/${branchId}`,
  },

  RIF: {
    VALIDATE_TOKEN: (token: string) => `${BASE_URL}/client/rif/validate-token?token=${token}`,
    GET_FORM_STRUCTURE: `${BASE_URL}/client/vendor?action=form`,
    GET_DRAFT: (submissionId: string) => `${BASE_URL}/client/vendor?action=draft&submissionId=${submissionId}`,
    GET_RISK_ASSESSMENT: (submissionId: string) => `${BASE_URL}/client/vendor?action=risk-assessment&submissionId=${submissionId}`,
    CHECK_SUBMISSION: (initiationId: string) => `${BASE_URL}/client/vendor?action=check-submission&initiationId=${initiationId}`,
    GET_SUMMARY: (submissionId: string) => `${BASE_URL}/client/vendor?action=summary&submissionId=${submissionId}`,
    VALIDATE_SUBMISSION: (submissionId: string) => `${BASE_URL}/client/vendor?action=validate&submissionId=${submissionId}`,
    GET_SECTION1_FORM: `${BASE_URL}/client/vendor?action=section1-form`,
    GET_MY_INITIATIONS: (adminId: string) => `${BASE_URL}/client/vendor?action=my-initiations&adminId=${adminId}`,
    CREATE_DRAFT: `${BASE_URL}/client/vendor?action=create-draft`,
    SUBMIT_FORM: `${BASE_URL}/client/vendor?action=submit`,
    INITIATE_RIF: `${BASE_URL}/client/vendor?action=initiate-rif`,
    SAVE_ANSWERS: `${BASE_URL}/client/vendor?action=save-answers`,
    EDIT_SECTION: `${BASE_URL}/client/vendor?action=edit-section`,
    GET_SUBMISSION_DETAILS: (submissionId: string) => `${BASE_URL}/client/vendor?action=submission-details&submissionId=${submissionId}`,
    APPROVE_SUBMISSION: `${BASE_URL}/client/vendor?action=approve-submission`,
    REJECT_SUBMISSION: `${BASE_URL}/client/vendor?action=reject-submission`,
  },


  VENDOR: {
    // Core vendor management
    GET_ALL: `${BASE_URL}/vendors`,
    GET_BY_ID: (id: string) => `${BASE_URL}/vendors/${id}`,
    CREATE: `${BASE_URL}/vendors`,
    UPDATE: (id: string) => `${BASE_URL}/vendors/${id}`,
    DELETE: (id: string) => `${BASE_URL}/vendors/${id}`,

    // Token verification
    VERIFY_TOKEN: (token: string) => `${BASE_URL}/vendor/verify/${token}`,

    // Vendor registration & profile
    REGISTER: `${BASE_URL}/vendor?action=register`,
    GET_PROFILE: (vendorId: string) => `${BASE_URL}/vendor?action=profile&vendorId=${vendorId}`,
    GET_PROFILE_BY_USER: (userId: string) => `${BASE_URL}/vendor?action=profile&userId=${userId}`,
    UPDATE_PROFILE: `${BASE_URL}/vendor?action=update-profile`,

    // Questionnaire management
    START_QUESTIONNAIRE: `${BASE_URL}/vendor?action=start-questionnaire`,
    SUBMIT_QUESTIONNAIRE: `${BASE_URL}/vendor?action=submit-questionnaire`,
    GET_QUESTIONNAIRE: (questionnaireId: string) => `${BASE_URL}/vendor?action=questionnaire&questionnaireId=${questionnaireId}`,
    GET_QUESTIONNAIRE_LIST: (vendorId: string) => `${BASE_URL}/vendor?action=questionnaire-list&vendorId=${vendorId}`,
    UPDATE_QUESTIONNAIRE_STATUS: `${BASE_URL}/vendor?action=update-questionnaire-status`,

    // Response management
    SAVE_RESPONSE: `${BASE_URL}/vendor?action=save-response`,
    BULK_SAVE_RESPONSES: `${BASE_URL}/vendor?action=bulk-save-responses`,
    GET_RESPONSES: (questionnaireId: string) => `${BASE_URL}/vendor?action=responses&questionnaireId=${questionnaireId}`,
    GET_RESPONSE: (responseId: string) => `${BASE_URL}/vendor?action=response&responseId=${responseId}`,
    UPDATE_RESPONSE: `${BASE_URL}/vendor?action=update-response`,

    // Progress tracking
    GET_PROGRESS: (questionnaireId: string) => `${BASE_URL}/vendor?action=progress&questionnaireId=${questionnaireId}`,

    // Invitation management (Client side)
    SEND_INVITATION: `${BASE_URL}/vendor/invitation`,
    GET_INVITATIONS: (clientId: string) => `${BASE_URL}/vendor/invitation?action=list&clientId=${clientId}`,
    GET_INVITATION_DETAILS: (invitationId: string) => `${BASE_URL}/vendor/invitation?action=details&invitationId=${invitationId}`,
    RESEND_INVITATION: `${BASE_URL}/vendor/invitation?action=resend`,
    CANCEL_INVITATION: `${BASE_URL}/vendor/invitation?action=cancel`,
  },

  EVIDENCE: {
    GET_ALL: `${BASE_URL}/evidence`,
    GET_BY_ID: (id: string) => `${BASE_URL}/evidence/${id}`,
    CREATE: `${BASE_URL}/evidence`,
    UPDATE: (id: string) => `${BASE_URL}/evidence/${id}`,
    DELETE: (id: string) => `${BASE_URL}/evidence/${id}`,
    CHANGE_STATUS: (id: string, status: string) => `${BASE_URL}/evidence/${id}/status/${status}`,
    GET_BY_VENDOR: (vendorId: string) => `${BASE_URL}/evidence/vendor/${vendorId}`,
  },

  STAFF: {
    GET_ALL: `${BASE_URL}/staff`,
    GET_BY_ID: (id: string) => `${BASE_URL}/staff/${id}`,
    CREATE: `${BASE_URL}/staff`,
    UPDATE: (id: string) => `${BASE_URL}/staff/${id}`,
    DELETE: (id: string) => `${BASE_URL}/staff/${id}`,
  },

  ADMIN: {
    DASHBOARD: `${BASE_URL}/admin/dashboard`,
    STATS: `${BASE_URL}/admin/stats`,
  },

  REPORTS: {
    GENERATE: `${BASE_URL}/reports/generate`,
    GET_ALL: `${BASE_URL}/reports`,
    GET_BY_ID: (id: string) => `${BASE_URL}/reports/${id}`,
    DOWNLOAD: (id: string) => `${BASE_URL}/reports/${id}/download`,
  }
};