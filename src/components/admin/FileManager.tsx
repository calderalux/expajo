'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Group,
  Text,
  Grid,
  Image,
  ActionIcon,
  Modal,
  Stack,
  TextInput,
  Select,
  Alert,
  LoadingOverlay,
  Badge,
  FileInput,
  Progress,
  Tabs,
  Title,
  Box,
  Flex,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUpload,
  IconTrash,
  IconEye,
  IconDownload,
  IconFolder,
  IconFolderPlus,
  IconRefresh,
  IconAlertCircle,
  IconFile,
  IconSearch,
  IconFilter
} from '@tabler/icons-react';
import { cn } from '@/utils/cn';

interface FileItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
  url: string;
  fullPath: string;
}

interface FolderItem {
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
}

interface FileManagerProps {
  onFileSelect?: (file: FileItem) => void;
  mode?: 'select' | 'manage';
}

interface UserPermissions {
  canView: boolean;
  canUpload: boolean;
  canDelete: boolean;
  canManageAll: boolean;
}

interface StorageStats {
  total_files: number;
  total_size: number;
  formatted_size: string;
  folder_breakdown: Array<{ folder: string; count: number }>;
  type_breakdown: Array<{ type: string; count: number }>;
}

const FOLDER_OPTIONS = [
  { value: '', label: 'Root' },
  { value: 'destinations', label: 'Destinations' },
  { value: 'packages', label: 'Packages' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'users', label: 'Users' },
  { value: 'temp', label: 'Temporary' }
];

export function FileManager({ onFileSelect, mode = 'manage' }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFolders, setShowFolders] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canView: false,
    canUpload: false,
    canDelete: false,
    canManageAll: false
  });
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  
  // Upload states
  const [uploadModalOpen, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  
  // Preview states
  const [previewModalOpen, { open: openPreviewModal, close: closePreviewModal }] = useDisclosure(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Load permissions and stats
  const loadPermissions = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/files/permissions', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPermissions(data.data.permissions);
      }
    } catch (err) {
      console.error('Load permissions error:', err);
    }
  }, []);

  const loadStorageStats = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/files/stats', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setStorageStats(data.data);
      }
    } catch (err) {
      console.error('Load stats error:', err);
    }
  }, []);

  // Load files and folders
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      
      // Load folders
      const foldersResponse = await fetch('/api/admin/files?listFolders=true', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      const foldersData = await foldersResponse.json();
      if (foldersData.success) {
        setFolders(foldersData.data);
      }

      // Load files
      const params = new URLSearchParams({
        folder: currentFolder,
        limit: '100'
      });

      const response = await fetch(`/api/admin/files?${params}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setFiles(data.data);
      } else {
        setError(data.error || 'Failed to load files');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Load files error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    loadPermissions();
    loadStorageStats();
    loadFiles();
  }, [loadPermissions, loadStorageStats, loadFiles]);

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', uploadFolder);
      if (uploadFileName) {
        formData.append('fileName', uploadFileName);
      }

      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadProgress(100);
        await loadFiles(); // Refresh file list
        closeUploadModal();
        setUploadFile(null);
        setUploadFileName('');
        setUploadFolder('');
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (filePath: string) => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/files/delete?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await loadFiles(); // Refresh file list
      } else {
        setError(data.error || 'Failed to delete file');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Delete error:', err);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      
      // Delete files one by one
      for (const filePath of selectedFiles) {
        const response = await fetch(`/api/admin/files/delete?path=${encodeURIComponent(filePath)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete file');
        }
      }

      setSelectedFiles([]);
      await loadFiles(); // Refresh file list
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Bulk delete error:', err);
    }
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title order={2} className="text-gray-900 font-playfair">
            File Manager
          </Title>
          <Text size="sm" c="dimmed">
            Manage images and files in Supabase Storage
          </Text>
        </div>
        <Group gap="sm">
          <Button
            variant="outline"
            leftSection={<IconRefresh size={16} />}
            onClick={() => {
              loadFiles();
              loadStorageStats();
            }}
          >
            Refresh
          </Button>
          {permissions.canUpload && (
            <Button
              leftSection={<IconUpload size={16} />}
              onClick={openUploadModal}
              className="bg-gradient-to-r from-primary to-secondary text-white"
            >
              Upload File
            </Button>
          )}
        </Group>
      </div>

      {/* Storage Statistics */}
      {storageStats && (
        <Card>
          <Title order={4} mb="md">Storage Statistics</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Text size="lg" fw={700} className="text-primary">
                  {storageStats.total_files}
                </Text>
                <Text size="sm" c="dimmed">Total Files</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Text size="lg" fw={700} className="text-primary">
                  {storageStats.formatted_size}
                </Text>
                <Text size="sm" c="dimmed">Total Size</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Text size="lg" fw={700} className="text-primary">
                  {storageStats.folder_breakdown.length}
                </Text>
                <Text size="sm" c="dimmed">Folders</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Text size="lg" fw={700} className="text-primary">
                  {storageStats.type_breakdown.length}
                </Text>
                <Text size="sm" c="dimmed">File Types</Text>
              </div>
            </Grid.Col>
          </Grid>
        </Card>
      )}

      {/* Folder Navigation */}
      <Card>
        <div className="space-y-4">
          <Group justify="space-between">
            <Title order={4}>Folders</Title>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFolders(!showFolders)}
            >
              {showFolders ? 'Hide' : 'Show'} Folders
            </Button>
          </Group>
          
          {showFolders && (
            <div className="space-y-2">
              {/* Root folder */}
              <Button
                variant={currentFolder === '' ? 'filled' : 'outline'}
                size="sm"
                leftSection={<IconFolder size={16} />}
                onClick={() => setCurrentFolder('')}
                className="w-full justify-start"
              >
                Root Folder
              </Button>
              
              {/* Dynamic folders from bucket */}
              {folders.map((folder) => (
                <Button
                  key={folder.path}
                  variant={currentFolder === folder.path ? 'filled' : 'outline'}
                  size="sm"
                  leftSection={<IconFolder size={16} />}
                  onClick={() => setCurrentFolder(folder.path)}
                  className="w-full justify-start"
                >
                  {folder.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <TextInput
              placeholder="Search files..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Text size="sm" c="dimmed" className="flex items-center h-full">
              Current: {currentFolder || 'Root'}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Text size="sm" c="dimmed" className="flex items-center h-full">
              {filteredFiles.length} file(s) found
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && permissions.canDelete && (
        <Card>
          <Group justify="space-between">
            <Text size="sm">
              {selectedFiles.length} file(s) selected
            </Text>
            <Button
              variant="outline"
              color="red"
              size="sm"
              leftSection={<IconTrash size={16} />}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </Group>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {/* Files Grid */}
      <Card className="relative">
        <LoadingOverlay visible={loading} />
        
        {filteredFiles.length > 0 ? (
          <Grid>
            {filteredFiles.map((file) => (
              <Grid.Col key={file.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* File Preview */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {file.metadata.mimetype.startsWith('image/') ? (
                        <Image
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder-image.jpg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IconFile size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="space-y-2">
                      <Text size="sm" fw={500} className="truncate" title={file.name}>
                        {file.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatFileSize(file.metadata.size)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(file.created_at)}
                      </Text>
                    </div>

                    {/* Actions */}
                    <Group gap="xs" justify="space-between">
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => {
                            setPreviewFile(file);
                            openPreviewModal();
                          }}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        
                        {mode === 'select' && (
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => onFileSelect?.(file)}
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                        )}
                        
                        {mode === 'manage' && permissions.canDelete && (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteFile(file.fullPath)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                      
                      {mode === 'manage' && permissions.canDelete && (
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.fullPath)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles(prev => [...prev, file.fullPath]);
                            } else {
                              setSelectedFiles(prev => prev.filter(path => path !== file.fullPath));
                            }
                          }}
                          className="rounded"
                        />
                      )}
                    </Group>
                  </div>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <div className="text-center py-12">
            <IconFile size={64} className="mx-auto text-gray-300 mb-4" />
            <Text c="dimmed" size="lg">No files found</Text>
            <Text c="dimmed" size="sm" className="mt-2">
              Upload your first file to get started
            </Text>
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        opened={uploadModalOpen}
        onClose={closeUploadModal}
        title="Upload File"
        size="md"
        centered
      >
        <Stack gap="md">
          <FileInput
            label="Select File"
            placeholder="Choose an image file"
            accept="image/*"
            value={uploadFile}
            onChange={setUploadFile}
            leftSection={<IconUpload size={16} />}
          />
          
          <TextInput
            label="Custom File Name (optional)"
            placeholder="Leave empty to use original name"
            value={uploadFileName}
            onChange={(e) => setUploadFileName(e.target.value)}
          />
          
          <Select
            label="Folder"
            placeholder="Select folder"
            data={[
              { value: '', label: 'Root' },
              ...folders.map(folder => ({ value: folder.path, label: folder.name }))
            ]}
            value={uploadFolder}
            onChange={(value) => setUploadFolder(value || '')}
            leftSection={<IconFolder size={16} />}
          />
          
          {uploading && (
            <div className="space-y-2">
              <Text size="sm">Uploading...</Text>
              <Progress value={uploadProgress} />
            </div>
          )}
          
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeUploadModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              loading={uploading}
            >
              Upload
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Preview Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={closePreviewModal}
        title={previewFile?.name}
        size="lg"
        centered
      >
        {previewFile && (
          <Stack gap="md">
            <div className="text-center">
              {previewFile.metadata.mimetype.startsWith('image/') ? (
                <Image
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-96 mx-auto"
                  fallbackSrc="/placeholder-image.jpg"
                />
              ) : (
                <div className="py-12">
                  <IconFile size={64} className="mx-auto text-gray-400 mb-4" />
                  <Text c="dimmed">Preview not available for this file type</Text>
                </div>
              )}
            </div>
            
            <Divider />
            
            <div className="space-y-2">
              <Group justify="space-between">
                <Text size="sm" fw={500}>File Size:</Text>
                <Text size="sm">{formatFileSize(previewFile.metadata.size)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Type:</Text>
                <Text size="sm">{previewFile.metadata.mimetype}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Created:</Text>
                <Text size="sm">{formatDate(previewFile.created_at)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Path:</Text>
                <Text size="sm" className="font-mono text-xs break-all">
                  {previewFile.fullPath}
                </Text>
              </Group>
            </div>
            
            <Group justify="flex-end" gap="sm">
              <Button variant="outline" onClick={closePreviewModal}>
                Close
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={() => window.open(previewFile.url, '_blank')}
              >
                Download
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
