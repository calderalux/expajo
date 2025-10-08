// File parsing utilities for import functionality
import * as XLSX from 'xlsx';

export interface ParseResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export async function parseImportFile(file: File, fileType: string): Promise<ParseResult> {
  try {
    const fileContent = await readFileContent(file);
    
    switch (fileType.toLowerCase()) {
      case 'json':
        return parseJSON(fileContent as string);
      case 'csv':
        return parseCSV(fileContent as string);
      case 'xlsx':
        return parseXLSX(fileContent as ArrayBuffer);
      default:
        return {
          success: false,
          error: `Unsupported file type: ${fileType}`,
        };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to parse file: ${error.message}`,
    };
  }
}

async function readFileContent(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target?.result || '');
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read as text for JSON and CSV, as array buffer for XLSX
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

function parseJSON(content: string): ParseResult {
  try {
    const data = JSON.parse(content);
    
    // Handle both single object and array of objects
    if (Array.isArray(data)) {
      return { success: true, data };
    } else if (typeof data === 'object' && data !== null) {
      return { success: true, data: [data] };
    } else {
      return {
        success: false,
        error: 'JSON file must contain an object or array of objects',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Invalid JSON format: ${error.message}`,
    };
  }
}

function parseCSV(content: string): ParseResult {
  try {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV file must contain at least a header row and one data row',
      };
    }
    
    const headers = parseCSVLine(lines[0]);
    const data: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
        // Pad with empty strings or truncate to match header length
        while (values.length < headers.length) {
          values.push('');
        }
        if (values.length > headers.length) {
          values.splice(headers.length);
        }
      }
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to parse CSV: ${error.message}`,
    };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    
    i++;
  }
  
  result.push(current.trim());
  return result;
}

function parseXLSX(content: ArrayBuffer): ParseResult {
  try {
    const workbook = XLSX.read(content, { type: 'array' });
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        error: 'Excel file contains no worksheets',
      };
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return {
        success: false,
        error: 'Excel file must contain at least a header row and one data row',
      };
    }
    
    // Convert to array of objects
    const headers = jsonData[0] as string[];
    const data: any[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      data.push(rowData);
    }
    
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to parse Excel file: ${error.message}`,
    };
  }
}

// Utility function to validate file type
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(extension || '');
}

// Utility function to get file type from filename
export function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'json':
      return 'json';
    case 'csv':
      return 'csv';
    case 'xlsx':
    case 'xls':
      return 'xlsx';
    default:
      return 'unknown';
  }
}

// Sample data generators for testing
export const sampleData = {
  destinations: [
    {
      name: 'Lagos',
      description: 'The commercial capital of Nigeria, known for its vibrant nightlife and business opportunities.',
      country: 'Nigeria',
      country_code: 'NG',
      region: 'Lagos State',
      image_cover_url: 'https://example.com/lagos.jpg',
      best_time_to_visit: 'November to March',
      climate: 'Tropical',
      language: 'English, Yoruba',
      currency: 'USD',
      featured: true,
      is_published: true,
      highlights: ['Victoria Island', 'Lekki Conservation Centre', 'National Museum'],
      image_gallery: ['https://example.com/lagos1.jpg', 'https://example.com/lagos2.jpg'],
    },
    {
      name: 'Abuja',
      description: 'The capital city of Nigeria, known for its modern architecture and political significance.',
      country: 'Nigeria',
      country_code: 'NG',
      region: 'Federal Capital Territory',
      image_cover_url: 'https://example.com/abuja.jpg',
      best_time_to_visit: 'October to April',
      climate: 'Tropical',
      language: 'English, Hausa',
      currency: 'USD',
      featured: true,
      is_published: true,
      highlights: ['Aso Rock', 'National Mosque', 'Millennium Park'],
      image_gallery: ['https://example.com/abuja1.jpg', 'https://example.com/abuja2.jpg'],
    },
  ],
};

// Generate sample CSV content
export function generateSampleCSV(): string {
  const headers = [
    'name',
    'description',
    'country',
    'country_code',
    'region',
    'image_cover_url',
    'best_time_to_visit',
    'climate',
    'language',
    'currency',
    'featured',
    'is_published',
    'highlights',
    'image_gallery',
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleData.destinations.map(dest => [
      `"${dest.name}"`,
      `"${dest.description}"`,
      `"${dest.country}"`,
      `"${dest.country_code}"`,
      `"${dest.region}"`,
      `"${dest.image_cover_url}"`,
      `"${dest.best_time_to_visit}"`,
      `"${dest.climate}"`,
      `"${dest.language}"`,
      `"${dest.currency}"`,
      dest.featured,
      dest.is_published,
      `"${dest.highlights.join(';')}"`,
      `"${dest.image_gallery.join(';')}"`,
    ].join(',')),
  ].join('\n');
  
  return csvContent;
}

// Generate sample JSON content
export function generateSampleJSON(): string {
  return JSON.stringify(sampleData.destinations, null, 2);
}
