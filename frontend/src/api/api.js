import axios from "axios";

// API base URL resolution:
// 1. VITE_API_URL (preferred, set in .env or deployment)
// 2. VITE_API_BASE_URL (legacy fallback)
// 3. localhost:8000 (local development default)
const baseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

const API_BASE_URL = `${baseUrl}/api/process`;
const API_ROOT = `${baseUrl}/api`;

export const validateWebsite = async (website) => {
  try {
    const response = await axios.post(
      `${API_ROOT}/validate`,
      {
        name: "Validation",
        email: "validate@check.com",
        website: website,
        recaptcha_token: "admin_bypass",
      },
      { timeout: 25000 },
    );
    return {
      valid: true,
      url: response.data.url,
      warning: response.data.warning,
      technical_warning: response.data.technical_warning,
    };
  } catch (error) {
    const detail = error.response?.data?.detail || "Website validation failed.";
    return { valid: false, error: detail };
  }
};

export const processSingleLead = async (leadData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/single`, leadData, {
      timeout: 180000, // 3 minute timeout for full analysis
    });
    return response.data;
  } catch (error) {
    console.error("Error processing single lead:", error);
    throw error;
  }
};

export const processBattle = async (battleData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/battle`, battleData, {
      timeout: 300000, // 5 minute timeout for battle (2 full analyses + LLM comparison)
    });
    return response.data;
  } catch (error) {
    console.error("Error processing battle analysis:", error);
    throw error;
  }
};

export const processCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_BASE_URL}/csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const emailReport = async (emailData) => {
  try {
    const response = await axios.post(`${API_ROOT}/email-report`, emailData, {
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error("Error emailing report:", error);
    throw error;
  }
};

export const emailGeoReport = async (emailData) => {
  try {
    console.log(
      "[GEO Email Report] Using API URL:",
      `${API_ROOT}/geo/email-report`,
    );
    console.log("[GEO Email Report] Payload:", emailData);
    const response = await axios.post(
      `${API_ROOT}/geo/email-report`,
      emailData,
      {
        timeout: 30000,
      },
    );
    console.log("[GEO Email Report] Success:", response.data);
    return response.data;
  } catch (error) {
    const errorText = error.response?.data || error.message;
    console.error("[GEO Email Report] Backend Error:", errorText);
    throw error;
  }
};
