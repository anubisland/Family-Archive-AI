# Family Archive AI - Setup Guide

Complete installation and configuration guide for the Family Archive AI system.

## 🎉 Current Status: **FULLY OPERATIONAL!** ✅

Your Family Archive AI is completely implemented and ready to use! All major features are working.

## ✅ **System Status:**
- ✅ **Backend API**: Complete with all endpoints
- ✅ **Frontend React App**: Fully functional user interface
- ✅ **Database**: SQLite with full schema (auto-created)
- ✅ **Photo Upload**: Drag & drop with image processing
- ✅ **Document Upload**: OCR text extraction (Arabic + English)
- ✅ **Family Management**: Complete CRUD operations
- ✅ **Family Tree Visualization**: Interactive D3.js tree with relationship management
- ✅ **Search & Analytics**: Real-time dashboard and filtering

## � System Requirements

### Hardware Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 2GB free space for application and uploads
- **Processor**: Modern multi-core CPU (Intel i5+ or AMD equivalent)

### Software Prerequisites
- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.0+ (included with Node.js)
- **Git**: For cloning repository ([Download](https://git-scm.com/))
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

## 🚀 Quick Installation

### 1. Clone the Repository
```bash
# Clone the main repository
git clone https://github.com/anubisland/Family-Archive-AI.git

# Navigate to project directory
cd Family-Archive-AI
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
🚀 Server running on port 3001
📊 Health check available at http://localhost:3001/health
✅ SQLite database initialized
📁 Upload directories created
```

### 3. Frontend Setup (New Terminal Window)
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install frontend dependencies
npm install

# Start React development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view family-archive-ai in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

### 4. Access the Application
- **Main Application**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

## 🗄️ Database & Storage

### Automatic Setup
The SQLite database is automatically created on first run:

```
backend/
├── family_archive.db        # Main SQLite database (auto-created)
├── uploads/
│   ├── documents/          # Document storage
│   │   └── thumbnails/     # Document thumbnails
│   └── photos/             # Photo storage
│       ├── thumbnails/     # Photo thumbnails  
│       └── medium/         # Medium-sized images
```

### No Manual Configuration Required!
- Database tables created automatically
- Upload directories created on startup
- Sample data available via scripts

## 🎯 Testing Your Installation

### 1. Backend Health Check
Visit: [http://localhost:3001/health](http://localhost:3001/health)

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Family Archive AI API is running",
  "timestamp": "2024-01-XX",
  "database": "Connected"
}
```

### 2. Frontend Access
1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the Family Archive AI dashboard
3. Navigate between Family, Documents, and Photos pages
4. All features should be fully functional

### 3. Feature Testing
Try these features to verify everything works:

**Family Management:**
- ➕ Add new family member
- ✏️ Edit person details
- 🔍 Search family members
- 👁️ View person details page

**Document Management:**
- 📄 Upload PDF or image documents
- 🔍 OCR text extraction works automatically
- 🏷️ Link documents to family members
- 📊 View document statistics

**Photo Management:**
- 📸 Drag & drop photo upload
- 🖼️ Photo gallery displays correctly
- 🏷️ Add event names and dates
- 👥 Link photos to people

## 🔧 Sample Data Generation

### Create Sample Family Data
```bash
# Navigate to backend directory
cd backend

# Generate sample family members and relationships
node create-sample-data.js
```

**Expected Output:**
```
✅ Created person: أحمد محمد الأحمد (Ahmed Mohamed Al-Ahmad)
✅ Created person: فاطمة علي السعد (Fatima Ali Al-Saad)  
✅ Created person: يوسف أحمد الأحمد (Yusuf Ahmed Al-Ahmad)
✅ Created person: مريم أحمد الأحمد (Mariam Ahmed Al-Ahmad)
✅ Added family relationships successfully
✅ Created timeline events
```

### Generate Sample Photos
```bash
# Create placeholder photo files for testing
node create-sample-images.js
```

**Expected Output:**
```
✅ Created sample image: sample-photo-1.jpg
✅ Created sample image: sample-photo-2.jpg
✅ Created sample image: sample-photo-3.jpg
✅ Created sample image: sample-photo-4.jpg
✅ Created sample image: sample-photo-5.jpg
```

## 📊 Complete API Documentation

### Core Endpoints
- **Health**: `GET /health`
- **Family**: `GET|POST|PUT|DELETE /api/persons`
- **Documents**: `GET|POST|PUT|DELETE /api/documents`  
- **Photos**: `GET|POST|PUT|DELETE /api/photos`
- **Search**: Available for all entities

### API Testing Examples

**Upload Document with OCR:**
```bash
curl -X POST http://localhost:3001/api/documents \
  -F "document=@path/to/document.pdf" \
  -F "person_id=123e4567-e89b-12d3-a456-426614174000"
```

**Upload Photos:**
```bash
curl -X POST http://localhost:3001/api/photos \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  -F "event_name=Birthday Party" \
  -F "date_taken=2023-12-25"
```

**Search People:**
```bash
curl "http://localhost:3001/api/persons/search?q=أحمد"
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Port Already in Use
```powershell
# Find process using port (Windows PowerShell)
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process
taskkill /PID <process_id> /F
```

#### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### Database connection issues
```bash
# Delete database file to recreate
rm backend/family_archive.db

# Restart backend server
cd backend
npm start
```

#### Frontend build issues
```bash
# Clear React cache
cd frontend
rm -rf node_modules/.cache
npm start
```

#### Upload directory permissions
```bash
# Manually create directories if needed
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/photos  
mkdir -p backend/uploads/documents/thumbnails
mkdir -p backend/uploads/photos/thumbnails
mkdir -p backend/uploads/photos/medium
```

## 🌐 Default Ports & Configuration

### Standard Configuration
- **Frontend (React)**: `http://localhost:3000`
- **Backend (Express)**: `http://localhost:3001`

### Changing Ports (if needed)

**Backend Port:**
```bash
# Create .env file in backend directory  
echo "PORT=3002" > backend/.env
```

**Frontend Port:**
```bash
# Create .env file in frontend directory
echo "PORT=3001" > frontend/.env

# Or start with custom port
PORT=3001 npm start
```

## 🛠️ Tech Stack Summary

### Backend Technologies
- **Node.js + Express**: RESTful API server
- **SQLite3**: Lightweight database (no setup required)
- **Tesseract.js**: OCR text extraction
- **Sharp**: Image processing and thumbnails
- **Multer**: File upload handling

### Frontend Technologies
- **React 18 + TypeScript**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing  
- **React Dropzone**: Drag & drop uploads
- **Heroicons**: Beautiful icon library

## 🔐 Security Features

✅ **Built-in Security:**
- Helmet.js security headers
- Rate limiting protection
- File type validation
- Input sanitization with Joi
- CORS configuration
- SQL injection protection

## 📱 Browser Compatibility

### Fully Supported
- ✅ **Chrome** 90+
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Edge** 90+

## 🎉 You're All Set!

Your Family Archive AI system is now fully operational with:

### ✅ **Available Features:**
1. **👥 Family Management**: Add, edit, search family members
2. **📄 Document Upload**: OCR text extraction in Arabic & English  
3. **📸 Photo Management**: Upload, organize, and link photos
4. **🔍 Advanced Search**: Search across all content
5. **📊 Analytics Dashboard**: Real-time statistics
6. **🌐 Modern Web Interface**: Beautiful, responsive design

### 🚀 **Ready to Use:**
- Visit [http://localhost:3000](http://localhost:3000)
- Start uploading your family photos and documents
- Build your digital family archive!

### 📞 **Need Help?**
- Check the main **README.md** for feature documentation
- Review **project-plan.md** for development details  
- Create GitHub issues for bugs or feature requests

---

**Family Archive AI** - Your digital family heritage preservation system is ready! 🏡✨
