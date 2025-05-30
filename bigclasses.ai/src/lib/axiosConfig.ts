import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const axiosInstance = axios.create({
  // baseURL: 'http://13.201.139.142:8000/api',
  baseURL: 'https://bigclasses.ai/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
