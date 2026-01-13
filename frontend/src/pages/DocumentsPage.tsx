import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, PhotoIcon, CloudArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { documentAPI, personAPI } from '../services/api';

interface Document {
  document_id: string;
  original_filename: string;
  document_type: string;
  upload_date: string;
  extracted_text?: string;
  confidence_score: number;
  person_name?: string;
  person_id?: string;
  mime_type: string;
  file_size: number;
}

interface Person {
  person_id: string;
  full_name: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');

  useEffect(() => {
    fetchDocuments();
    fetchPersons();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getAll();
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersons = async () => {
    try {
      const response = await personAPI.getAll(1, 100);
      setPersons(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch persons:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('document', file);
        if (selectedPerson) {
          formData.append('person_id', selectedPerson);
        }

        await documentAPI.upload(formData);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setUploading(false);
    fetchDocuments();
  }, [selectedPerson]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const response = await documentAPI.search(searchTerm);
        setDocuments(response.data.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      fetchDocuments();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => {
    const isImage = document.mime_type?.startsWith('image/');
    
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {isImage ? (
              <PhotoIcon className="h-8 w-8 text-purple-500" />
            ) : (
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {document.original_filename}
            </h3>
            <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
              <span className="capitalize">{document.document_type}</span>
              <span>•</span>
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>{new Date(document.upload_date).toLocaleDateString()}</span>
            </div>
            
            {document.person_name && (
              <p className="mt-1 text-sm text-gray-600">
                Linked to: <span className="font-medium">{document.person_name}</span>
              </p>
            )}
            
            {document.extracted_text && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">Extracted Text:</p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                  {document.extracted_text}
                </p>
                {document.confidence_score > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      OCR Confidence: {Math.round(document.confidence_score)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-2 text-sm text-gray-700">
          Upload and manage family documents with AI-powered text extraction
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h2>
        
        {/* Person Selection */}
        {persons.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Family Member (Optional)
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
            >
              <option value="">Select a family member...</option>
              {persons.map((person) => (
                <option key={person.person_id} value={person.person_id}>
                  {person.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports: Images (JPG, PNG, GIF), PDF, Word documents
          </p>
        </div>

        {uploading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Processing documents with OCR...</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search documents by text, filename, or person..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {documents.map((document) => (
            <DocumentCard key={document.document_id} document={document} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first document.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
