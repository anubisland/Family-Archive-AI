import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PersonsPage from './pages/PersonsPage';
import DocumentsPage from './pages/DocumentsPage';
import PhotosPage from './pages/PhotosPage';
import PersonDetails from './pages/PersonDetails';
import FamilyTreePage from './pages/FamilyTreePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/persons" element={<PersonsPage />} />
            <Route path="/persons/:id" element={<PersonDetails />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/photos" element={<PhotosPage />} />
            <Route path="/family-tree" element={<FamilyTreePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
