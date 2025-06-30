import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const axiosInstance = axios.create({
  // baseURL: 'https://www.stage.bigclasses.ai/api',
  baseURL: 'http://localhost:8000/api',
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
