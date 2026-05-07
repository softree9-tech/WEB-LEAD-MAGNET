import axios from 'axios';

// In production, set VITE_API_BASE_URL in your Vercel project environment variables
// e.g. https://your-backend.onrender.com/api/process
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/process`
  : 'http://localhost:8000/api/process';

export const processSingleLead = async (leadData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/single`, leadData);
    return response.data;
  } catch (error) {
    console.error('Error processing single lead:', error);
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
