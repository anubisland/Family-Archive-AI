import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create sample image placeholders
const createSampleImages = () => {
  const photosDir = path.join(__dirname, 'uploads', 'photos');
  
  // Ensure directory exists
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }

  // Create simple SVG placeholder images
  const sampleImages = [
    'sample-photo-1.jpg',
    'sample-photo-2.jpg', 
    'sample-photo-3.jpg',
    'sample-photo-4.jpg',
    'sample-photo-5.jpg'
  ];

  sampleImages.forEach((filename, index) => {
    const colors = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C'];
    const events = ['Family Reunion', 'Graduation', 'Birthday', 'Anniversary', 'Vacation'];
    
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="${colors[index]}"/>
      <text x="200" y="130" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${events[index]}</text>
      <text x="200" y="160" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Sample Photo ${index + 1}</text>
      <circle cx="80" cy="80" r="30" fill="white" opacity="0.3"/>
      <polygon points="320,80 340,120 300,120" fill="white" opacity="0.3"/>
      <rect x="60" y="200" width="280" height="80" fill="white" opacity="0.2" rx="8"/>
    </svg>`;

    // Write SVG file (we'll rename to .jpg but it will still be SVG - modern browsers handle this)
    const filepath = path.join(photosDir, filename);
    fs.writeFileSync(filepath, svgContent);
    console.log(`✅ Created sample image: ${filename}`);
  });

  console.log('\n🎉 Sample images created successfully!');
  console.log('📁 Location:', photosDir);
  console.log('💡 These are SVG placeholder images that will display in the photo gallery.');
};

createSampleImages();
