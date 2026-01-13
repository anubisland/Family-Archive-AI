import React, { useState } from 'react';

interface Person {
  person_id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
}

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  persons: Person[];
  onAddRelationship: (personId: string, relativeId: string, relationType: string) => void;
}

const relationshipTypes = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
];

const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({
  isOpen,
  onClose,
  persons,
  onAddRelationship
}) => {
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedRelative, setSelectedRelative] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPerson || !selectedRelative || !selectedRelationType) {
      alert('Please fill in all fields');
      return;
    }

    if (selectedPerson === selectedRelative) {
      alert('A person cannot have a relationship with themselves');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAddRelationship(selectedPerson, selectedRelative, selectedRelationType);
      // Reset form
      setSelectedPerson('');
      setSelectedRelative('');
      setSelectedRelationType('');
    } catch (error) {
      console.error('Error adding relationship:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPerson('');
    setSelectedRelative('');
    setSelectedRelationType('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Family Relationship</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Person Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Person
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a person...</option>
              {persons.map((person) => (
                <option key={person.person_id} value={person.person_id}>
                  {person.full_name}
                  {person.birth_date && ` (${new Date(person.birth_date).getFullYear()})`}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select
              value={selectedRelationType}
              onChange={(e) => setSelectedRelationType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select relationship...</option>
              {relationshipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Relative Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Relative
            </label>
            <select
              value={selectedRelative}
              onChange={(e) => setSelectedRelative(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a relative...</option>
              {persons
                .filter(person => person.person_id !== selectedPerson)
                .map((person) => (
                  <option key={person.person_id} value={person.person_id}>
                    {person.full_name}
                    {person.birth_date && ` (${new Date(person.birth_date).getFullYear()})`}
                  </option>
                ))}
            </select>
          </div>

          {/* Relationship Preview */}
          {selectedPerson && selectedRelative && selectedRelationType && (
            <div className="mb-4 p-3 bg-blue-50 rounded border">
              <div className="text-sm text-blue-800">
                <strong>Relationship Preview:</strong>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {persons.find(p => p.person_id === selectedPerson)?.full_name} is the{' '}
                <strong>{selectedRelationType}</strong> of{' '}
                {persons.find(p => p.person_id === selectedRelative)?.full_name}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedPerson || !selectedRelative || !selectedRelationType}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Relationship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRelationshipModal;