# Admin File Management System

This document explains how to use the admin file management system for Supabase Storage.

## Overview

The file management system provides a complete interface for managing images and files in your Supabase Storage bucket. It includes:

- **File Upload**: Upload images and files to organized folders
- **File Browser**: View and manage existing files
- **File Preview**: Preview images and file details
- **File Deletion**: Delete individual or multiple files
- **File Selection**: Select files for use in forms

## Components

### 1. FileManager Component

The main file management interface with full CRUD operations.

```tsx
import { FileManager } from '@/components/admin/FileManager';

// Full management mode
<FileManager mode="manage" />

// File selection mode for forms
<FileManager mode="select" onFileSelect={(file) => console.log(file)} />
```

**Props:**
- `mode`: `'manage' | 'select'` - Controls the interface behavior
- `onFileSelect`: `(file: FileItem) => void` - Callback when a file is selected (select mode only)

### 2. FileSelector Component

A reusable component for selecting files in forms.

```tsx
import { FileSelector } from '@/components/admin/FileSelector';

<FileSelector
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  label="Cover Image"
  placeholder="Select an image"
  required={true}
  folder="destinations"
  accept="image/*"
/>
```

**Props:**
- `value`: `string` - Current file URL
- `onChange`: `(url: string) => void` - Callback when file changes
- `label`: `string` - Form field label
- `placeholder`: `string` - Placeholder text
- `required`: `boolean` - Whether field is required
- `folder`: `string` - Default folder for uploads
- `accept`: `string` - Accepted file types

## API Endpoints

### GET /api/admin/files

List files in a folder.

**Query Parameters:**
- `folder`: Folder path (optional, defaults to root)
- `limit`: Number of files to return (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "image.jpg",
      "id": "uuid",
      "url": "https://...",
      "fullPath": "destinations/image.jpg",
      "metadata": {
        "size": 1024000,
        "mimetype": "image/jpeg"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST /api/admin/files

Upload a new file.

**Form Data:**
- `file`: File to upload
- `folder`: Target folder (optional)
- `fileName`: Custom filename (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "destinations/image.jpg",
    "url": "https://...",
    "name": "image.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

### DELETE /api/admin/files/delete

Delete a file.

**Query Parameters:**
- `path`: Full file path to delete

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Folder Structure

The system organizes files into logical folders:

- **Root** (`/`): General files
- **destinations** (`/destinations`): Destination images
- **packages** (`/packages`): Package images
- **experiences** (`/experiences`): Experience images
- **users** (`/users`): User profile images
- **temp** (`/temp`): Temporary files

## File Types Supported

- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Maximum size**: 10MB per file
- **Validation**: Automatic file type and size validation

## Usage Examples

### 1. Basic File Management

```tsx
// In your admin page
import { FileManager } from '@/components/admin/FileManager';

export default function AdminFilesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FileManager mode="manage" />
    </div>
  );
}
```

### 2. File Selection in Forms

```tsx
import { FileSelector } from '@/components/admin/FileSelector';

function DestinationForm() {
  const [coverImage, setCoverImage] = useState('');

  return (
    <form>
      <FileSelector
        value={coverImage}
        onChange={setCoverImage}
        label="Cover Image"
        placeholder="Select a cover image"
        required={true}
        folder="destinations"
        accept="image/*"
      />
    </form>
  );
}
```

### 3. Custom File Upload

```tsx
async function uploadFile(file: File, folder: string = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/admin/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data;
}
```

## Security

- **Authentication**: All endpoints require admin authentication
- **Authorization**: Uses admin session tokens
- **File Validation**: Server-side file type and size validation
- **Path Sanitization**: Prevents directory traversal attacks

## Error Handling

The system provides comprehensive error handling:

- **Network errors**: Automatic retry suggestions
- **File validation errors**: Clear error messages
- **Permission errors**: Proper authentication prompts
- **Storage errors**: Fallback error messages

## Performance Features

- **Lazy loading**: Files loaded on demand
- **Pagination**: Efficient handling of large file lists
- **Image optimization**: Automatic image compression
- **Caching**: Browser and CDN caching for uploaded files

## Integration with Existing Components

The file management system integrates seamlessly with:

- **Destination forms**: For destination images
- **Package forms**: For package images
- **User profiles**: For profile pictures
- **Content management**: For general media files

## Best Practices

1. **Organize files**: Use appropriate folders for different content types
2. **Optimize images**: Compress images before upload when possible
3. **Use descriptive names**: Name files descriptively for easier management
4. **Clean up**: Regularly remove unused files from the temp folder
5. **Monitor usage**: Keep track of storage usage to avoid limits

## Troubleshooting

### Common Issues

1. **Upload fails**: Check file size and type restrictions
2. **Files not showing**: Verify folder permissions and authentication
3. **Slow loading**: Check network connection and file sizes
4. **Permission errors**: Ensure admin session is valid

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` to see detailed error messages in the console.
