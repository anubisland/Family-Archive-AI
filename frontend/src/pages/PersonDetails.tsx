import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserIcon, DocumentTextIcon, PhotoIcon, CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { personAPI, documentAPI, photoAPI } from '../services/api';

interface Person {
  person_id: string;
  full_name: string;
  gender?: string;
  birth_date?: string;
  biography?: string;
  avatar_url?: string;
  created_at: string;
}

interface Document {
  document_id: string;
  original_filename: string;
  document_type: string;
  upload_date: string;
  confidence_score: number;
}

interface Photo {
  photo_id: string;
  original_filename: string;
  file_path: string;
  event_name?: string;
  date_taken?: string;
  created_at: string;
}

const PersonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPersonDetails(id);
    }
  }, [id]);

  const fetchPersonDetails = async (personId: string) => {
    try {
      const [personResponse, documentsResponse, photosResponse, timelineResponse] = await Promise.all([
        personAPI.getById(personId),
        documentAPI.getByPerson(personId),
        photoAPI.getByPerson(personId),
        personAPI.getTimeline(personId)
      ]);

      setPerson(personResponse.data.data);
      setDocuments(documentsResponse.data.data || []);
      setPhotos(photosResponse.data.data || []);
      setTimeline(timelineResponse.data.data || []);
    } catch (error) {
      console.error('Failed to fetch person details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Person not found.</p>
        <Link to="/persons" className="text-primary-600 hover:text-primary-800">
          Back to Family Members
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/persons"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Family Members
        </Link>
      </div>

      {/* Person Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {person.avatar_url ? (
              <img
                className="h-20 w-20 rounded-full object-cover"
                src={person.avatar_url}
                alt={person.full_name}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-gray-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{person.full_name}</h1>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              {person.gender && (
                <span className="capitalize">{person.gender}</span>
              )}
              {person.birth_date && (
                <>
                  {person.gender && <span>•</span>}
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Born {new Date(person.birth_date).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
            {person.biography && (
              <p className="mt-4 text-gray-700">{person.biography}</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-6 w-6 mr-2" />
          Documents ({documents.length})
        </h2>
        
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.document_id}
                className="flex items-center p-4 border border-gray-200 rounded-lg"
              >
                <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-4" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {document.original_filename}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Type: {document.document_type} • 
                    Uploaded: {new Date(document.upload_date).toLocaleDateString()}
                  </p>
                </div>
                {document.confidence_score > 0 && (
                  <div className="text-sm text-green-600">
                    OCR: {Math.round(document.confidence_score)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No documents uploaded yet</p>
            <Link
              to="/documents"
              className="mt-2 text-primary-600 hover:text-primary-800 text-sm"
            >
              Upload documents
            </Link>
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <PhotoIcon className="h-6 w-6 mr-2" />
          Photos ({photos.length})
        </h2>
        
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.photo_id} className="bg-gray-50 rounded-lg p-3">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                  <img
                    src={photo.file_path.startsWith('/uploads/') 
                      ? `http://localhost:3001${photo.file_path}`
                      : `http://localhost:3001/uploads/photos/${photo.file_path.split(/[/\\]/).pop()}`
                    }
                    alt={photo.original_filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 truncate" title={photo.original_filename}>
                  {photo.original_filename}
                </p>
                {photo.event_name && (
                  <p className="text-xs text-purple-600 truncate">
                    {photo.event_name}
                  </p>
                )}
                {photo.date_taken && (
                  <p className="text-xs text-gray-500">
                    {new Date(photo.date_taken).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No photos uploaded yet</p>
            <Link
              to="/photos"
              className="mt-2 text-primary-600 hover:text-primary-800 text-sm"
            >
              Upload photos
            </Link>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      {timeline.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2" />
            Timeline
          </h2>
          
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.event_id || index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 capitalize">
                    {event.event_type}
                  </h3>
                  {event.event_date && (
                    <p className="text-sm text-gray-500">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonDetails;
