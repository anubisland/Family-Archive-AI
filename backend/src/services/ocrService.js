import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OCRService {
  constructor() {
    this.languages = 'ara+eng'; // Arabic + English
    this.options = {
      logger: m => console.log(`OCR Progress: ${m.status} ${Math.round(m.progress * 100)}%`)
    };
  }

  // Preprocess image for better OCR results
  async preprocessImage(imagePath) {
    try {
      const processedPath = imagePath.replace(/\.[^/.]+$/, '_processed.jpg');
      
      await sharp(imagePath)
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .jpeg({ quality: 95 })
        .toFile(processedPath);
        
      return processedPath;
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return imagePath; // Return original if preprocessing fails
    }
  }

  // Extract text from image
  async extractText(imagePath) {
    try {
      console.log(`Starting OCR for: ${imagePath}`);
      
      // Preprocess image
      const processedPath = await this.preprocessImage(imagePath);
      
      // Perform OCR
      const result = await Tesseract.recognize(processedPath, this.languages, this.options);
      
      const extractedData = {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        paragraphs: result.data.paragraphs
      };

      console.log(`OCR completed with confidence: ${extractedData.confidence}%`);
      
      return extractedData;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  // Clean and process extracted text
  cleanText(rawText) {
    if (!rawText) return '';
    
    return rawText
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\u061C\u200E\u200Fa-zA-Z0-9\s\-.,!?()]/g, '') // Keep Arabic, English, numbers, and basic punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  // Classify document type based on extracted text
  classifyDocument(text, filename = '') {
    const cleanText = text.toLowerCase();
    const filenameClean = filename.toLowerCase();

    // Document type patterns
    const patterns = {
      certificate: [
        'شهادة', 'certificate', 'diploma', 'degree', 'graduation',
        'جامعة', 'university', 'college', 'مدرسة', 'school',
        'بكالوريوس', 'bachelor', 'ماجستير', 'master', 'دكتوراه', 'phd'
      ],
      identity: [
        'هوية', 'identity', 'passport', 'جواز', 'بطاقة',
        'رقم قومي', 'national id', 'id card'
      ],
      birth_certificate: [
        'ميلاد', 'birth', 'مولود', 'born', 'تاريخ الميلاد',
        'date of birth', 'birth certificate'
      ],
      marriage_certificate: [
        'زواج', 'marriage', 'متزوج', 'married', 'عقد زواج',
        'marriage certificate', 'wedding'
      ],
      official_document: [
        'حكومة', 'government', 'وزارة', 'ministry', 'رسمي',
        'official', 'مصلحة', 'هيئة', 'authority'
      ]
    };

    // Check patterns in text and filename
    for (const [type, keywords] of Object.entries(patterns)) {
      const found = keywords.some(keyword => 
        cleanText.includes(keyword) || filenameClean.includes(keyword)
      );
      if (found) return type;
    }

    // Default classification based on file type
    if (/\.(pdf|doc|docx)$/i.test(filename)) return 'document';
    if (/\.(jpg|jpeg|png|gif)$/i.test(filename)) return 'photo';
    
    return 'unknown';
  }

  // Main OCR processing function
  async processDocument(imagePath, filename = '') {
    try {
      console.log(`Processing document: ${filename}`);
      
      // Extract text
      const ocrResult = await this.extractText(imagePath);
      
      // Clean text
      const cleanedText = this.cleanText(ocrResult.text);
      
      // Classify document
      const documentType = this.classifyDocument(ocrResult.text, filename);
      
      // Extract key information
      const keyInfo = this.extractKeyInfo(cleanedText, documentType);
      
      return {
        originalText: ocrResult.text,
        cleanedText,
        confidence: ocrResult.confidence,
        documentType,
        keyInfo,
        wordCount: cleanedText.split(' ').length,
        language: this.detectLanguage(cleanedText)
      };
    } catch (error) {
      console.error('Document processing failed:', error);
      throw error;
    }
  }

  // Extract key information based on document type
  extractKeyInfo(text, documentType) {
    const info = {};
    
    // Extract dates
    const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})/g;
    const dates = text.match(dateRegex) || [];
    if (dates.length > 0) info.dates = dates;
    
    // Extract names (basic pattern for Arabic and English names)
    const nameRegex = /([A-Z][a-z]+ [A-Z][a-z]+)|([أ-ي]+ [أ-ي]+)/g;
    const names = text.match(nameRegex) || [];
    if (names.length > 0) info.names = names.slice(0, 5); // Limit to first 5 names
    
    // Extract numbers (could be IDs, phone numbers, etc.)
    const numberRegex = /\b\d{6,}\b/g;
    const numbers = text.match(numberRegex) || [];
    if (numbers.length > 0) info.numbers = numbers;
    
    return info;
  }

  // Simple language detection
  detectLanguage(text) {
    const arabicRegex = /[\u0600-\u06FF]/;
    const englishRegex = /[a-zA-Z]/;
    
    const hasArabic = arabicRegex.test(text);
    const hasEnglish = englishRegex.test(text);
    
    if (hasArabic && hasEnglish) return 'mixed';
    if (hasArabic) return 'arabic';
    if (hasEnglish) return 'english';
    return 'unknown';
  }
}

export default new OCRService();
