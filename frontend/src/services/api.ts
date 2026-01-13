import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Person API
export const personAPI = {
  getAll: (page = 1, limit = 20) => 
    api.get(`/persons?page=${page}&limit=${limit}`),
  
  getById: (id: string) => 
    api.get(`/persons/${id}`),
  
  create: (personData: any) => 
    api.post('/persons', personData),
  
  update: (id: string, personData: any) => 
    api.put(`/persons/${id}`, personData),
  
  delete: (id: string) => 
    api.delete(`/persons/${id}`),
  
  search: (query: string) => 
    api.get(`/persons/search?q=${encodeURIComponent(query)}`),
  
  getFamily: (id: string) => 
    api.get(`/persons/${id}/family`),
  
  getTimeline: (id: string) => 
    api.get(`/persons/${id}/timeline`),
};

// Document API
export const documentAPI = {
  getAll: (page = 1, limit = 20) => 
    api.get(`/documents?page=${page}&limit=${limit}`),
  
  getById: (id: string) => 
    api.get(`/documents/${id}`),
  
  getByPerson: (personId: string) => 
    api.get(`/documents/person/${personId}`),
  
  upload: (formData: FormData) => 
    api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id: string, documentData: any) => 
    api.put(`/documents/${id}`, documentData),
  
  delete: (id: string) => 
    api.delete(`/documents/${id}`),
  
  search: (query: string) => 
    api.get(`/documents/search?q=${encodeURIComponent(query)}`),
  
  getByType: (type: string) => 
    api.get(`/documents/search?type=${type}`),
  
  reprocess: (id: string) => 
    api.post(`/documents/${id}/reprocess`),
};

// Photo API
export const photoAPI = {
  getAll: (page = 1, limit = 20) => 
    api.get(`/photos?page=${page}&limit=${limit}`),
  
  getById: (id: string) => 
    api.get(`/photos/${id}`),
  
  getByPerson: (personId: string) => 
    api.get(`/photos/person/${personId}`),
  
  upload: (formData: FormData) => 
    api.post('/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id: string, photoData: any) => 
    api.put(`/photos/${id}`, photoData),
  
  delete: (id: string) => 
    api.delete(`/photos/${id}`),
  
  search: (query: string) => 
    api.get(`/photos/search?q=${encodeURIComponent(query)}`),
  
  searchByDateRange: (dateFrom: string, dateTo: string) => 
    api.get(`/photos/search?date_from=${dateFrom}&date_to=${dateTo}`),
  
  getStats: () => 
    api.get('/photos/stats'),
};

export default api;
