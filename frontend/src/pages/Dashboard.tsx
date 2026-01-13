import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, DocumentTextIcon, PhotoIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { personAPI, documentAPI, photoAPI } from '../services/api';

interface DashboardStats {
  totalPersons: number;
  totalDocuments: number;
  totalPhotos: number;
  recentDocuments: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPersons: 0,
    totalDocuments: 0,
    totalPhotos: 0,
    recentDocuments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [personsResponse, documentsResponse, photosResponse] = await Promise.all([
          personAPI.getAll(1, 100),
          documentAPI.getAll(1, 10),
          photoAPI.getStats()
        ]);

        const documents = documentsResponse.data.data || [];
        const photoStats = photosResponse.data.data || {};
        
        setStats({
          totalPersons: personsResponse.data.data?.length || 0,
          totalDocuments: documents.length,
          totalPhotos: photoStats.totalPhotos || 0,
          recentDocuments: documents.slice(0, 5)
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback for photos if API fails
        try {
          const [personsResponse, documentsResponse] = await Promise.all([
            personAPI.getAll(1, 100),
            documentAPI.getAll(1, 10)
          ]);

          const documents = documentsResponse.data.data || [];
          const photos = documents.filter((doc: any) => doc.mime_type?.startsWith('image/'));
          
          setStats({
            totalPersons: personsResponse.data.data?.length || 0,
            totalDocuments: documents.length,
            totalPhotos: photos.length,
            recentDocuments: documents.slice(0, 5)
          });
        } catch (fallbackError) {
          console.error('Failed to fetch fallback dashboard data:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color: string;
    link?: string;
  }> = ({ title, value, icon: Icon, color, link }) => {
    const content = (
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-gray-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-bold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    );

    return link ? <Link to={link}>{content}</Link> : content;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900">Family Archive Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your family's documents, photos, and memories with AI-powered organization.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Family Members"
          value={stats.totalPersons}
          icon={UsersIcon}
          color="border-blue-500"
          link="/persons"
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={DocumentTextIcon}
          color="border-green-500"
          link="/documents"
        />
        <StatCard
          title="Photos"
          value={stats.totalPhotos}
          icon={PhotoIcon}
          color="border-purple-500"
          link="/photos"
        />
        <StatCard
          title="OCR Processed"
          value={stats.totalDocuments}
          icon={ChartBarIcon}
          color="border-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/persons"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UsersIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="font-medium">Add Family Member</h3>
              <p className="text-sm text-gray-500">Create a new person profile</p>
            </div>
          </Link>
          
          <Link
            to="/documents"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-medium">Upload Document</h3>
              <p className="text-sm text-gray-500">Add documents with OCR processing</p>
            </div>
          </Link>
          
          <Link
            to="/photos"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PhotoIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h3 className="font-medium">Upload Photos</h3>
              <p className="text-sm text-gray-500">Add family photos with metadata</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Documents */}
      {stats.recentDocuments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Documents</h2>
          <div className="space-y-3">
            {stats.recentDocuments.map((doc: any) => (
              <div key={doc.document_id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{doc.original_filename}</h3>
                  <p className="text-sm text-gray-500">
                    Type: {doc.document_type} • 
                    {doc.person_name && ` Person: ${doc.person_name} • `}
                    Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                  </p>
                </div>
                {doc.confidence_score > 0 && (
                  <div className="text-sm text-green-600">
                    OCR: {Math.round(doc.confidence_score)}%
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/documents"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              View all documents →
            </Link>
          </div>
        </div>
      )}

      {/* Getting Started */}
      {stats.totalPersons === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Getting Started</h2>
          <p className="text-blue-800 mb-4">
            Welcome to Family Archive AI! Here's how to get started:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Add your first family member</li>
            <li>Upload documents or photos</li>
            <li>Let AI extract and organize information</li>
            <li>Build your family tree and timeline</li>
          </ol>
          <div className="mt-6">
            <Link
              to="/persons"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add First Family Member
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
