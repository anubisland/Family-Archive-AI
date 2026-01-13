# Family Archive AI - Frontend

React TypeScript frontend for the Family Archive AI system with comprehensive family management features.

## 🌟 Features

### 📱 **Application Pages**
- **Dashboard**: Analytics and quick actions
- **Family Members**: Complete person management
- **Documents**: Upload and OCR management
- **Photos**: Gallery and metadata management
- **Family Tree**: Interactive visualization with D3.js

### 🌳 **Family Tree Visualization**
- Interactive D3.js-based family tree
- Click-to-expand nodes with gender-based styling
- Dual view modes: Tree visualization and list view
- Add/remove family relationships
- Real-time statistics dashboard
- Relationship validation and management

### 🎨 **UI Components**
- Modern React components with TypeScript
- Responsive design with Tailwind CSS
- Drag & drop file uploads
- Advanced search and filtering
- Real-time data updates

## 🚀 Development Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production deployment

### `npm test`
Launches the test runner

## 📡 API Integration

The frontend connects to the backend API at `http://localhost:3001` with proxy configuration for seamless development.

### Key API Endpoints Used:
- `/api/persons` - Family member management
- `/api/family-tree/*` - Family tree operations
- `/api/documents` - Document and OCR operations
- `/api/photos` - Photo management

## 🛠️ Technology Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **D3.js** for family tree visualization
- **react-d3-tree** for interactive tree components
- **Axios** for API communication
- **React Dropzone** for file uploads

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
