import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/process';

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
