# Family Archive AI

An AI-powered family archive system that helps organize, digitize, and preserve family documents, photos, and memories using OCR, face recognition, and intelligent document classification.

## 🌟 Features

### ✅ **Currently Available:**
- **👥 Family Management**: Complete CRUD operations for family members
- **📄 Document Upload & OCR**: Upload and extract text from documents in Arabic and English
- **📸 Photo Management**: Upload, organize, and manage family photos with metadata
- **🔍 Advanced Search**: Search through persons, documents, and photos
- **📊 Dashboard Analytics**: Real-time statistics and insights
- **📈 Family Tree Visualization**: Interactive family tree with D3.js visualization
- **🌐 Modern Web UI**: Beautiful, responsive React frontend
- **🗄️ SQLite Database**: Lightweight, efficient data storage
- **🔄 Full-Stack Integration**: Complete API with frontend integration

### 🚧 **Coming Soon:**
- **👤 Face Recognition**: Identify and tag people in photos
- **⏰ Timeline Generation**: Chronological life timelines
- **🤖 Auto CV Generation**: AI-generated biographies from documents
- **🧠 Smart Document Classification**: Automatic document categorization

## 🎯 Live Demo

Access the running application:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Health**: [http://localhost:3001/health](http://localhost:3001/health)
- **Photos API**: [http://localhost:3001/api/photos](http://localhost:3001/api/photos)

## 🏗️ Project Structure

```
Family-Archive-AI/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # SQLite database configuration
│   │   ├── controllers/    # Route controllers (Person, Document, Photo)
│   │   ├── models/         # Database models with full CRUD
│   │   ├── routes/         # API routes for all entities
│   │   └── services/       # OCR and business logic services
│   ├── uploads/            # File uploads directory
│   │   ├── documents/      # Document storage
│   │   └── photos/         # Photo storage with thumbnails
│   ├── create-sample-data.js  # Sample family data generator
│   └── server.js          # Main server file
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API integration services
│   │   └── App.tsx         # Main application component
│   └── package.json
└── project-plan.md         # Detailed project planning document
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git** for cloning the repository

### Quick Start Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anubisland/Family-Archive-AI.git
   cd Family-Archive-AI
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Create environment configuration
   cp .env.example .env
   
   # Start the backend server
   npm start
   ```
   
   The API will be running on `http://localhost:3001`

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   
   # Start the React development server
   npm start
   ```
   
   The web application will be running on `http://localhost:3000`

4. **Create sample data** (optional)
   ```bash
   cd backend
   node create-sample-data.js
   node create-sample-photos.js
   node create-sample-images.js
   ```

### 🎊 You're Ready!

- Open [http://localhost:3000](http://localhost:3000) to access the web application
- Use the navigation to explore **Family Members**, **Documents**, and **Photos**
- Upload your first family document or photo to see OCR in action!

## 📱 Application Features

### 👥 **Family Members Management**
- ✅ Add family members with full profiles
- ✅ Edit biographical information, dates, relationships
- ✅ View detailed person pages with documents and photos
- ✅ Search and filter family members

### 📄 **Document Management**
- ✅ Drag & drop document upload
- ✅ OCR text extraction (Arabic + English)
- ✅ Link documents to family members
- ✅ Document search and filtering
- ✅ Support for PDF, Word, and image formats

### 📸 **Photo Management**
- ✅ Bulk photo upload with drag & drop
- ✅ Photo gallery with grid view
- ✅ Add event names, dates, and person links
- ✅ Photo editing and metadata management
- ✅ Search photos by person, event, or filename

### 📊 **Analytics Dashboard**
- ✅ Real-time family archive statistics
- ✅ Quick action buttons for common tasks
- ✅ Recent documents and activity feeds
- ✅ Visual data representation

### 🌳 **Family Tree Visualization**
- ✅ Interactive D3.js-based family tree visualization
- ✅ Add and manage family relationships (parent/child/spouse/sibling)
- ✅ Dual view modes: Tree visualization and detailed list view
- ✅ Family statistics dashboard with connection metrics
- ✅ Click-to-expand nodes with gender-based styling
- ✅ Real-time relationship management with validation

## � API Documentation

### Core Endpoints

**Health Check:**
```bash
GET http://localhost:3001/health
```

**Family Members:**
```bash
GET    http://localhost:3001/api/persons         # Get all family members
POST   http://localhost:3001/api/persons         # Create new family member
GET    http://localhost:3001/api/persons/:id     # Get specific family member
PUT    http://localhost:3001/api/persons/:id     # Update family member
DELETE http://localhost:3001/api/persons/:id     # Delete family member
```

**Family Tree:**
```bash
GET    http://localhost:3001/api/family-tree/full                    # Get complete family tree data
GET    http://localhost:3001/api/family-tree/person/:personId        # Get person's relationships
POST   http://localhost:3001/api/family-tree/relationship           # Create new relationship
DELETE http://localhost:3001/api/family-tree/relationship/:id       # Delete relationship
GET    http://localhost:3001/api/family-tree/stats                  # Get family statistics
```

**Documents:**
```bash
GET    /api/persons          # List all persons
POST   /api/persons          # Create new person
GET    /api/persons/:id      # Get person details
PUT    /api/persons/:id      # Update person
DELETE /api/persons/:id      # Delete person
GET    /api/persons/search   # Search persons
```

**Documents:**
```bash
GET    /api/documents        # List documents
POST   /api/documents        # Upload document (with OCR)
GET    /api/documents/:id    # Get document details
PUT    /api/documents/:id    # Update document
DELETE /api/documents/:id    # Delete document
GET    /api/documents/search # Search documents
```

**Photos:**
```bash
GET    /api/photos           # List photos
POST   /api/photos           # Upload photos
GET    /api/photos/:id       # Get photo details
PUT    /api/photos/:id       # Update photo metadata
DELETE /api/photos/:id       # Delete photo
GET    /api/photos/stats     # Photo statistics
```

### Example Usage

**Upload a document with OCR:**
```bash
curl -X POST http://localhost:3001/api/documents \
  -F "document=@path/to/document.pdf" \
  -F "person_id=123e4567-e89b-12d3-a456-426614174000"
```

**Upload photos:**
```bash
curl -X POST http://localhost:3001/api/photos \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  -F "event_name=Birthday Party" \
  -F "date_taken=2023-12-25"
```

## 🛠️ Tech Stack

### **Backend Technologies:**
- **Node.js + Express.js**: RESTful API server
- **SQLite3**: Lightweight, file-based database
- **Tesseract.js**: OCR text extraction engine
- **Sharp**: High-performance image processing
- **Multer**: File upload handling
- **Joi**: Input validation and sanitization
- **UUID**: Unique identifier generation

### **Frontend Technologies:**
- **React 19 + TypeScript**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icon library
- **React Router**: Client-side routing
- **React Dropzone**: Drag & drop file uploads
- **Axios**: HTTP client for API calls

### **Development Tools:**
- **Nodemon**: Auto-restart development server
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing pipeline
- **Create React App**: Frontend build tooling

## 🗄️ Database Schema

**SQLite database with 6 main tables:**

- **Persons**: Family members with biographical data
- **Family_Relationships**: Parent-child relationships and family tree structure
- **Documents**: Document metadata with OCR extracted text
- **Photos**: Photo metadata with event and person linking
- **Events**: Timeline events for family history
- **Auto_CV**: AI-generated biography content (planned)

## 🔄 Development Progress

### ✅ **Phase 1 - Core System (Complete)**
- [x] Project structure and configuration
- [x] SQLite database with full schema
- [x] Complete backend API with all CRUD operations
- [x] Input validation and error handling
- [x] File upload and static serving

### ✅ **Phase 2 - Document & Photo Management (Complete)**
- [x] Document upload with OCR integration
- [x] Photo upload with image processing
- [x] Metadata management and search
- [x] File organization and storage
- [x] Sample data generation scripts

### ✅ **Phase 3 - Frontend Application (Complete)**
- [x] Modern React application with TypeScript
- [x] Complete UI for all features
- [x] Responsive design with Tailwind CSS
- [x] Real-time API integration
- [x] Advanced search and filtering

### 🚧 **Phase 4 - Advanced AI Features (In Progress)**
- [ ] Face recognition and tagging
- [ ] Auto CV generation from documents
- [ ] Smart document classification
- [ ] Family tree visualization
- [ ] Advanced analytics and insights

## � Security & Performance

### **Security Features:**
- **Helmet.js**: Security HTTP headers
- **Rate limiting**: API endpoint protection
- **File validation**: Secure file upload filtering
- **Input sanitization**: Joi validation on all inputs
- **CORS configuration**: Cross-origin request control

### **Performance Optimizations:**
- **Image processing**: Automatic thumbnail generation
- **Database indexing**: Optimized query performance
- **Pagination**: Efficient data loading
- **Static file caching**: Fast asset delivery
- **Chunked uploads**: Large file handling

## � Sample Data

The system includes comprehensive sample data:
- **4 Family Members**: Arabic names with full profiles
- **12 Family Relationships**: Parent-child connections
- **4 Timeline Events**: Life milestones and achievements
- **5 Sample Photos**: Placeholder images with metadata
- **Sample Documents**: Ready for OCR testing

## � Deployment Ready

The application is production-ready with:
- Environment configuration
- Error handling and logging
- Database migration scripts
- Static file optimization
- Process management ready

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, questions, or feature requests:
- Open an issue in the GitHub repository
- Check the project documentation
- Review the API endpoints and examples

---

**Family Archive AI** - Preserving memories with the power of artificial intelligence 🏡✨

*Built with ❤️ for families who want to preserve their heritage digitally*
