import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FamilyTreeVisualization from '../components/FamilyTreeVisualization';
import AddRelationshipModal from '../components/AddRelationshipModal';

interface Person {
  person_id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  biography: string | null;
  avatar_url: string | null;
  children: Person[];
  parents: Person[];
  spouses: Person[];
  siblings: Person[];
}

interface Relationship {
  relation_id: string;
  person_id: string;
  relative_id: string;
  relation_type: string;
  person_name: string;
  relative_name: string;
  person_gender: string;
  relative_gender: string;
}

interface FamilyTreeStats {
  total_persons: number;
  total_relationships: number;
  parent_relationships: number;
  child_relationships: number;
  spouse_relationships: number;
  sibling_relationships: number;
}

const FamilyTreePage: React.FC = () => {
  const [familyData, setFamilyData] = useState<{
    persons: Person[];
    relationships: Relationship[];
    tree: Person[];
  }>({
    persons: [],
    relationships: [],
    tree: []
  });
  const [stats, setStats] = useState<FamilyTreeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    fetchFamilyTreeData();
    fetchStats();
  }, []);

  const fetchFamilyTreeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/family-tree/full');
      
      if (!response.ok) {
        throw new Error('Failed to fetch family tree data');
      }
      
      const data = await response.json();
      setFamilyData(data);
    } catch (error) {
      console.error('Error fetching family tree:', error);
      setError('Failed to load family tree data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = async (personId: string, relativeId: string, relationType: string) => {
    try {
      const response = await fetch('/api/family-tree/relationship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId,
          relativeId,
          relationType
        }),
      });

      if (response.ok) {
        // Refresh data
        await fetchFamilyTreeData();
        await fetchStats();
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add relationship');
      }
    } catch (error) {
      console.error('Error adding relationship:', error);
      setError('Failed to add relationship. Please try again.');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/family-tree/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    if (!window.confirm('Are you sure you want to delete this relationship?')) {
      return;
    }

    try {
      const response = await fetch(`/api/family-tree/relationship/${relationshipId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFamilyTreeData();
        await fetchStats();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete relationship');
      }
    } catch (error) {
      console.error('Error deleting relationship:', error);
      setError('Failed to delete relationship. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
          <button 
            onClick={fetchFamilyTreeData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Family Tree</h1>
              <p className="text-gray-600 mt-1">Visualize your family relationships and connections</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'tree' ? 'list' : 'tree')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
              >
                {viewMode === 'tree' ? '📋' : '🌳'} 
                {viewMode === 'tree' ? 'List View' : 'Tree View'}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                ➕ Add Relationship
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.total_persons}</div>
              <div className="text-sm text-gray-600">Total People</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.total_relationships}</div>
              <div className="text-sm text-gray-600">Relationships</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.parent_relationships}</div>
              <div className="text-sm text-gray-600">Parents</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{stats.child_relationships}</div>
              <div className="text-sm text-gray-600">Children</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-pink-600">{stats.spouse_relationships}</div>
              <div className="text-sm text-gray-600">Spouses</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">{stats.sibling_relationships}</div>
              <div className="text-sm text-gray-600">Siblings</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        {viewMode === 'tree' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FamilyTreeVisualization 
              treeData={familyData.tree}
              onPersonClick={setSelectedPerson}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* People List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Family Members</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {familyData.persons.map((person) => (
                  <div key={person.person_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {person.avatar_url ? (
                          <img src={person.avatar_url} alt={person.full_name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {person.gender === 'male' ? '👨' : person.gender === 'female' ? '👩' : '👤'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{person.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {person.birth_date && new Date(person.birth_date).getFullYear()}
                          {person.death_date && ` - ${new Date(person.death_date).getFullYear()}`}
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/persons/${person.person_id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Relationships</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {familyData.relationships.map((relationship) => (
                  <div key={relationship.relation_id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {relationship.person_name} → {relationship.relative_name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {relationship.relation_type}
                        </div>
                      </div>
                      <button
                        onClick={() => {/* handleDeleteRelationship(relationship.relation_id) */}}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Delete relationship"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Relationship Modal */}
      <AddRelationshipModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        persons={familyData.persons}
        onAddRelationship={handleAddRelationship}
      />
    </div>
  );
};

export default FamilyTreePage;