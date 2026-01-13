import React from 'react';
import Tree from 'react-d3-tree';

interface Person {
  person_id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  avatar_url: string | null;
  children: Person[];
}

interface FamilyTreeVisualizationProps {
  treeData: Person[];
  onPersonClick?: (personId: string) => void;
}

interface TreeNode {
  name: string;
  attributes?: any;
  children?: TreeNode[];
}

const FamilyTreeVisualization: React.FC<FamilyTreeVisualizationProps> = ({ 
  treeData, 
  onPersonClick 
}) => {
  // Convert family data to react-d3-tree format
  const convertToTreeData = (persons: Person[]): TreeNode[] => {
    return persons.map(person => ({
      name: person.full_name,
      attributes: {
        person_id: person.person_id,
        gender: person.gender,
        birth_date: person.birth_date,
        death_date: person.death_date,
        avatar_url: person.avatar_url
      },
      children: person.children ? convertToTreeData(person.children) : []
    }));
  };

  // Custom node component
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => (
    <g>
      {/* Node background */}
      <circle
        r={25}
        fill={nodeDatum.attributes?.gender === 'male' ? '#3B82F6' : 
              nodeDatum.attributes?.gender === 'female' ? '#EC4899' : '#6B7280'}
        stroke="#1F2937"
        strokeWidth="2"
        onClick={() => {
          if (onPersonClick && nodeDatum.attributes?.person_id) {
            onPersonClick(nodeDatum.attributes.person_id);
          }
        }}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Person icon */}
      <text
        fill="white"
        fontSize="16"
        x="0"
        y="6"
        textAnchor="middle"
      >
        {nodeDatum.attributes?.gender === 'male' ? '♂' : 
         nodeDatum.attributes?.gender === 'female' ? '♀' : '⚪'}
      </text>
      
      {/* Name label */}
      <text
        fill="#1F2937"
        fontSize="12"
        x="0"
        y="45"
        textAnchor="middle"
        fontWeight="bold"
      >
        {nodeDatum.name}
      </text>
      
      {/* Birth/Death dates */}
      {(nodeDatum.attributes?.birth_date || nodeDatum.attributes?.death_date) && (
        <text
          fill="#6B7280"
          fontSize="10"
          x="0"
          y="58"
          textAnchor="middle"
        >
          {nodeDatum.attributes?.birth_date && new Date(nodeDatum.attributes.birth_date).getFullYear()}
          {nodeDatum.attributes?.death_date && ` - ${new Date(nodeDatum.attributes.death_date).getFullYear()}`}
        </text>
      )}
    </g>
  );

  const treeDataConverted = convertToTreeData(treeData);

  if (treeDataConverted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <div className="text-6xl mb-4">🌳</div>
        <h3 className="text-xl font-semibold mb-2">No Family Tree Data</h3>
        <p className="text-center max-w-md">
          Start building your family tree by adding family members and their relationships. 
          Click "Add Relationship" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <Tree
        data={treeDataConverted}
        renderCustomNodeElement={renderCustomNodeElement}
        orientation="vertical"
        translate={{ x: 400, y: 50 }}
        separation={{ siblings: 2, nonSiblings: 2 }}
        nodeSize={{ x: 120, y: 120 }}
        zoom={0.8}
        enableLegacyTransitions
      />
    </div>
  );
};

export default FamilyTreeVisualization;