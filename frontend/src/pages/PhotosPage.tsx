import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, MagnifyingGlassIcon, CalendarDaysIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { photoAPI, personAPI } from '../services/api';

interface Photo {
  photo_id: string;
  original_filename: string;
  file_path: string;
  event_name?: string;
  date_taken?: string;
  detected_faces: number;
  file_size: number;
  width?: number;
  height?: number;
  created_at: string;
  person_name?: string;
  person_id?: string;
}

interface Person {
  person_id: string;
  full_name: string;
}

const PhotosPage: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [eventName, setEventName] = useState('');
  const [dateTaken, setDateTaken] = useState('');
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
    fetchPersons();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoAPI.getAll();
      setPhotos(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
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

    try {
      const formData = new FormData();
      
      acceptedFiles.forEach(file => {
        formData.append('photos', file);
      });
      
      if (selectedPerson) {
        formData.append('person_id', selectedPerson);
      }
      if (eventName) {
        formData.append('event_name', eventName);
      }
      if (dateTaken) {
        formData.append('date_taken', dateTaken);
      }

      await photoAPI.upload(formData);
      
      // Reset form
      setSelectedPerson('');
      setEventName('');
      setDateTaken('');
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      fetchPhotos();
    }
  }, [selectedPerson, eventName, dateTaken]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const response = await photoAPI.search(searchTerm);
        setPhotos(response.data.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      fetchPhotos();
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await photoAPI.delete(photoId);
      setPhotos(photos.filter(photo => photo.photo_id !== photoId));
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const handleEditPhoto = async (photo: Photo) => {
    setEditingPhoto(photo);
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    try {
      const updateData = {
        person_id: editingPhoto.person_id || null,
        event_name: editingPhoto.event_name || null,
        date_taken: editingPhoto.date_taken || null,
      };

      await photoAPI.update(editingPhoto.photo_id, updateData);
      setEditingPhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error('Failed to update photo:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageUrl = (filePath: string) => {
    // Handle both absolute and relative paths
    if (filePath.startsWith('/uploads/')) {
      return `http://localhost:3001${filePath}`;
    } else if (filePath.includes('uploads')) {
      // Extract the filename from full path
      const filename = filePath.split(/[/\\]/).pop();
      return `http://localhost:3001/uploads/photos/${filename}`;
    } else {
      // Just a filename
      return `http://localhost:3001/uploads/photos/${filePath}`;
    }
  };

  const PhotoCard: React.FC<{ photo: Photo }> = ({ photo }) => {
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={getImageUrl(photo.file_path)}
            alt={photo.original_filename}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
            }}
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 truncate" title={photo.original_filename}>
            {photo.original_filename}
          </h3>
          
          {photo.person_name && (
            <p className="text-sm text-blue-600">
              👤 {photo.person_name}
            </p>
          )}
          
          {photo.event_name && (
            <p className="text-sm text-purple-600">
              🎉 {photo.event_name}
            </p>
          )}
          
          {photo.date_taken && (
            <p className="text-sm text-green-600 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              {new Date(photo.date_taken).toLocaleDateString()}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatFileSize(photo.file_size)}</span>
            {photo.width && photo.height && (
              <span>{photo.width}×{photo.height}</span>
            )}
          </div>
          
          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => handleEditPhoto(photo)}
              className="flex-1 flex items-center justify-center px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              <PencilIcon className="h-3 w-3 mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleDeletePhoto(photo.photo_id)}
              className="flex-1 flex items-center justify-center px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              <TrashIcon className="h-3 w-3 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Family Photos</h1>
        <p className="mt-2 text-sm text-gray-700">
          Upload and manage your family photos with metadata
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Photos</h2>
        
        {/* Upload Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Birthday, Wedding, Vacation..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Taken (Optional)
            </label>
            <input
              type="date"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={dateTaken}
              onChange={(e) => setDateTaken(e.target.value)}
            />
          </div>
        </div>

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
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the photos here...'
              : 'Drag and drop photos here, or click to select photos'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports: JPG, PNG, GIF, WebP (up to 50MB each)
          </p>
        </div>

        {uploading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Uploading and processing photos...</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search photos by filename, event, or person..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading photos...</p>
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <PhotoCard key={photo.photo_id} photo={photo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first photo.
          </p>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Photo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Member
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editingPhoto.person_id || ''}
                    onChange={(e) => setEditingPhoto({
                      ...editingPhoto,
                      person_id: e.target.value || undefined
                    })}
                  >
                    <option value="">No family member</option>
                    {persons.map((person) => (
                      <option key={person.person_id} value={person.person_id}>
                        {person.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editingPhoto.event_name || ''}
                    onChange={(e) => setEditingPhoto({
                      ...editingPhoto,
                      event_name: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Taken
                  </label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editingPhoto.date_taken?.split('T')[0] || ''}
                    onChange={(e) => setEditingPhoto({
                      ...editingPhoto,
                      date_taken: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdatePhoto}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosPage;
