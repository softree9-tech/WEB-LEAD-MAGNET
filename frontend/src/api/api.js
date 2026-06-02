import axios from 'axios';

// API base URL resolution:
// 1. VITE_API_URL (preferred, set in .env or deployment)
// 2. VITE_API_BASE_URL (legacy fallback)
// 3. localhost:8000 (local development default)
const baseUrl = import.meta.env.VITE_API_URL
  || import.meta.env.VITE_API_BASE_URL
  || 'http://localhost:8000';

const API_BASE_URL = `${baseUrl}/api/process`;

export const processSingleLead = async (leadData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/single`, leadData);
    return response.data;
  } catch (error) {
    console.error('Error processing single lead:', error);
    throw error;
  }
};

export const processBattle = async (battleData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/battle`, battleData);
    return response.data;
  } catch (error) {
    console.error('Error processing battle analysis:', error);
    throw error;
  }
};

export const processCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
};
