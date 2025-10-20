'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  Stack,
  Text,
  Group,
  Image,
  ActionIcon,
  LoadingOverlay,
  Alert,
  TextInput,
  Select,
  Grid
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUpload,
  IconEye,
  IconCheck,
  IconAlertCircle,
  IconFolder,
  IconSearch
} from '@tabler/icons-react';
import { FileManager } from './FileManager';

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

interface FileSelectorProps {
  value?: string;
  onChange: (fileUrl: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  accept?: string;
  folder?: string;
}

export function FileSelector({
  value,
  onChange,
  placeholder = "Select a file",
  label,
  required = false,
  error,
  accept = "image/*",
  folder = ""
}: FileSelectorProps) {
  const [modalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewOpen, { open: openPreview, close: closePreview }] = useDisclosure(false);

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    onChange(file.url);
    closeModal();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {/* Current file display */}
        {selectedFile && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <Group justify="space-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {selectedFile.metadata.mimetype.startsWith('image/') ? (
                    <Image
                      src={selectedFile.url}
                      alt={selectedFile.name}
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder-image.jpg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconFolder size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Text size="sm" fw={500} className="truncate">
                    {selectedFile.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(selectedFile.metadata.size / 1024).toFixed(1)} KB
                  </Text>
                </div>
              </div>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(selectedFile);
                    openPreview();
                  }}
                >
                  <IconEye size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={handleRemoveFile}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              </Group>
            </Group>
          </div>
        )}

        {/* Select file button */}
        <Button
          variant="outline"
          leftSection={<IconUpload size={16} />}
          onClick={openModal}
          className="w-full"
        >
          {selectedFile ? 'Change File' : placeholder}
        </Button>

        {/* Error message */}
        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}
      </div>

      {/* File selection modal */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title="Select File"
        size="xl"
        centered
      >
        <div className="h-96">
          <FileManager
            mode="select"
            onFileSelect={handleFileSelect}
          />
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal
        opened={previewOpen}
        onClose={closePreview}
        title={selectedFile?.name}
        size="lg"
        centered
      >
        {selectedFile && (
          <Stack gap="md">
            <div className="text-center">
              {selectedFile.metadata.mimetype.startsWith('image/') ? (
                <Image
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-96 mx-auto"
                  fallbackSrc="/placeholder-image.jpg"
                />
              ) : (
                <div className="py-12">
                  <IconFolder size={64} className="mx-auto text-gray-400 mb-4" />
                  <Text c="dimmed">Preview not available for this file type</Text>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Group justify="space-between">
                <Text size="sm" fw={500}>File Size:</Text>
                <Text size="sm">{(selectedFile.metadata.size / 1024).toFixed(1)} KB</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Type:</Text>
                <Text size="sm">{selectedFile.metadata.mimetype}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Path:</Text>
                <Text size="sm" className="font-mono text-xs break-all">
                  {selectedFile.fullPath}
                </Text>
              </Group>
            </div>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
