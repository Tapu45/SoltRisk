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

  VENDOR: {
    GET_ALL: `${BASE_URL}/vendors`,
    GET_BY_ID: (id: string) => `${BASE_URL}/vendors/${id}`,
    CREATE: `${BASE_URL}/vendors`,
    UPDATE: (id: string) => `${BASE_URL}/vendors/${id}`,
    DELETE: (id: string) => `${BASE_URL}/vendors/${id}`,
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