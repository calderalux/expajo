// Server-side file parsing utilities for import functionality
import * as XLSX from 'xlsx';

export interface ParseResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export async function parseImportFileServer(file: File, fileType: string): Promise<ParseResult> {
  try {
    const fileContent = await readFileContentServer(file);
    
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

async function readFileContentServer(file: File): Promise<string | ArrayBuffer> {
  // Convert File to ArrayBuffer for server-side processing
  const arrayBuffer = await file.arrayBuffer();
  
  // For JSON and CSV, convert ArrayBuffer to string
  if (file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.csv')) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(arrayBuffer);
  }
  
  // For XLSX, return ArrayBuffer directly
  return arrayBuffer;
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
