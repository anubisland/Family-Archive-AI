import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { personAPI } from '../services/api';

interface Person {
  person_id: string;
  full_name: string;
  gender?: string;
  birth_date?: string;
  biography?: string;
  avatar_url?: string;
  created_at: string;
}

const PersonsPage: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerson, setNewPerson] = useState({
    full_name: '',
    gender: '',
    birth_date: '',
    biography: ''
  });

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const response = await personAPI.getAll();
      setPersons(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const response = await personAPI.search(searchTerm);
        setPersons(response.data.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      fetchPersons();
    }
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await personAPI.create(newPerson);
      setShowAddModal(false);
      setNewPerson({ full_name: '', gender: '', birth_date: '', biography: '' });
      fetchPersons();
    } catch (error) {
      console.error('Failed to add person:', error);
    }
  };

  const PersonCard: React.FC<{ person: Person }> = ({ person }) => (
    <Link
      to={`/persons/${person.person_id}`}
      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {person.avatar_url ? (
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={person.avatar_url}
              alt={person.full_name}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-gray-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium text-gray-900 truncate">
            {person.full_name}
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {person.gender && (
              <span className="capitalize">{person.gender}</span>
            )}
            {person.birth_date && (
              <>
                {person.gender && <span>•</span>}
                <span>Born {new Date(person.birth_date).toLocaleDateString()}</span>
              </>
            )}
          </div>
          {person.biography && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {person.biography}
            </p>
          )}
        </div>
      </div>
    </Link>
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your family members and their information
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Family Member
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search family members..."
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

      {/* Persons Grid */}
      {persons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {persons.map((person) => (
            <PersonCard key={person.person_id} person={person} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No family members</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first family member.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Family Member
            </button>
          </div>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Family Member</h3>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newPerson.full_name}
                  onChange={(e) => setNewPerson({ ...newPerson, full_name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newPerson.gender}
                  onChange={(e) => setNewPerson({ ...newPerson, gender: e.target.value })}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Birth Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newPerson.birth_date}
                  onChange={(e) => setNewPerson({ ...newPerson, birth_date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Biography
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newPerson.biography}
                  onChange={(e) => setNewPerson({ ...newPerson, biography: e.target.value })}
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Add Person
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonsPage;
