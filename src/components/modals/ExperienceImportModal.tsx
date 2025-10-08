'use client';

import React, { useState, useRef } from 'react';
import { Modal, Stack, Group, Text, Button, Alert, Progress, Tabs, TextInput, Checkbox, Select } from '@mantine/core';
import { IconUpload, IconAlertCircle, IconCheck, IconX, IconFileText, IconTable, IconFileSpreadsheet } from '@tabler/icons-react';
import { parseImportFile, validateFileType, getFileType, generateSampleCSV, generateSampleJSON } from '@/lib/utils/file-parser';
import { serviceTypeToLabel } from '@/types/database';

interface ExperienceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

interface ImportOptions {
  skipDuplicates: boolean;
  defaultValues: {
    category: string;
    featured: boolean;
    is_active: boolean;
    rating: number;
    reviews_count: number;
  };
}

interface ImportProgress {
  stage: 'idle' | 'uploading' | 'parsing' | 'validating' | 'importing' | 'completed' | 'error';
  progress: number;
  message: string;
}

const experienceCategories = [
  ...Object.values(serviceTypeToLabel),
] as const;

export function ExperienceImportModal({ isOpen, onClose, onSuccess }: ExperienceImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    defaultValues: {
      category: 'Culture',
      featured: false,
      is_active: true,
      rating: 0,
      reviews_count: 0,
    },
  });
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const type = getFileType(selectedFile.name);
      if (type === 'unknown') {
        setError('Unsupported file type. Please select a JSON, CSV, or XLSX file.');
        return;
      }
      
      setFile(selectedFile);
      setFileType(type);
      setError('');
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setProgress({ stage: 'uploading', progress: 0, message: 'Preparing file...' });
    setError('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('options', JSON.stringify(importOptions));

      setProgress({ stage: 'uploading', progress: 25, message: 'Uploading file...' });

      // Send to API
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/experiences/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: formData,
      });

      setProgress({ stage: 'importing', progress: 75, message: 'Processing experiences...' });

      const result = await response.json();

      if (result.success) {
        setProgress({ stage: 'completed', progress: 100, message: 'Import completed successfully!' });
        setImportResult(result.data);
        onSuccess(result.data);
      } else {
        setProgress({ stage: 'error', progress: 0, message: 'Import failed' });
        setError(result.error || 'Import failed');
      }
    } catch (err: any) {
      setProgress({ stage: 'error', progress: 0, message: 'Import failed' });
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileType('');
    setImportOptions({
      skipDuplicates: true,
      defaultValues: {
        category: 'Culture',
        featured: false,
        is_active: true,
        rating: 0,
        reviews_count: 0,
      },
    });
    setProgress({ stage: 'idle', progress: 0, message: '' });
    setImportResult(null);
    setError('');
    onClose();
  };

  const downloadSample = (format: 'csv' | 'json') => {
    const content = format === 'csv' ? generateSampleExperienceCSV() : generateSampleExperienceJSON();
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiences_sample.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json':
        return <IconFileText size={20} />;
      case 'csv':
        return <IconTable size={20} />;
      case 'xlsx':
        return <IconFileSpreadsheet size={20} />;
      default:
        return <IconUpload size={20} />;
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title="Import Experiences"
      size="lg"
      centered
    >
      <Stack gap="lg">
        {/* File Upload Section */}
        <div>
          <Text size="sm" fw={500} mb="xs">Select File</Text>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!file ? (
              <div>
                <IconUpload size={48} className="mx-auto text-gray-400 mb-4" />
                <Text size="sm" c="dimmed" mb="md">
                  Click to select a file or drag and drop
                </Text>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <Text size="xs" c="dimmed" mt="sm">
                  Supported formats: JSON, CSV, XLSX
                </Text>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                {getFileIcon(fileType)}
                <div className="text-left">
                  <Text size="sm" fw={500}>{file.name}</Text>
                  <Text size="xs" c="dimmed">
                    {(file.size / 1024).toFixed(1)} KB • {fileType.toUpperCase()}
                  </Text>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setFileType('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <IconX size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Import Options */}
        <Tabs defaultValue="options">
          <Tabs.List>
            <Tabs.Tab value="options">Import Options</Tabs.Tab>
            <Tabs.Tab value="samples">Sample Files</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="options" pt="md">
            <Stack gap="md">
              <Checkbox
                label="Skip duplicate experiences"
                description="Skip experiences that already exist (by title and location)"
                checked={importOptions.skipDuplicates}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  skipDuplicates: e.currentTarget.checked,
                }))}
              />

              <Text size="sm" fw={500}>Default Values</Text>
              
              <Select
                label="Default Category"
                value={importOptions.defaultValues.category}
                onChange={(value) => setImportOptions(prev => ({
                  ...prev,
                  defaultValues: {
                    ...prev.defaultValues,
                    category: value || 'Culture',
                  },
                }))}
                data={experienceCategories.map(cat => ({ value: cat, label: cat }))}
              />

              <TextInput
                label="Default Rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={importOptions.defaultValues.rating}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  defaultValues: {
                    ...prev.defaultValues,
                    rating: parseFloat(e.target.value) || 0,
                  },
                }))}
              />

              <TextInput
                label="Default Reviews Count"
                type="number"
                min="0"
                value={importOptions.defaultValues.reviews_count}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  defaultValues: {
                    ...prev.defaultValues,
                    reviews_count: parseInt(e.target.value) || 0,
                  },
                }))}
              />

              <Checkbox
                label="Mark as featured"
                description="Set featured status for imported experiences"
                checked={importOptions.defaultValues.featured}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  defaultValues: {
                    ...prev.defaultValues,
                    featured: e.currentTarget.checked,
                  },
                }))}
              />

              <Checkbox
                label="Activate experiences"
                description="Make imported experiences visible to the public"
                checked={importOptions.defaultValues.is_active}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  defaultValues: {
                    ...prev.defaultValues,
                    is_active: e.currentTarget.checked,
                  },
                }))}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="samples" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Download sample files to see the expected format for importing experiences.
              </Text>
              
              <Group>
                <Button
                  variant="outline"
                  leftSection={<IconFileText size={16} />}
                  onClick={() => downloadSample('json')}
                >
                  Download JSON Sample
                </Button>
                <Button
                  variant="outline"
                  leftSection={<IconTable size={16} />}
                  onClick={() => downloadSample('csv')}
                >
                  Download CSV Sample
                </Button>
              </Group>

              <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
                <Text size="sm">
                  <strong>Required fields:</strong> title, location, category<br/>
                  <strong>Optional fields:</strong> description, price_per_person, duration_hours, max_capacity, image_urls, features, rating, reviews_count, is_featured, is_active
                </Text>
              </Alert>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Progress */}
        {progress.stage !== 'idle' && (
          <div>
            <Text size="sm" fw={500} mb="xs">Import Progress</Text>
            <Progress value={progress.progress} size="lg" mb="xs" />
            <Text size="sm" c="dimmed">{progress.message}</Text>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Import Error"
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        {/* Import Results */}
        {importResult && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Import Completed"
            color="green"
            variant="light"
          >
            <Stack gap="xs">
              <Text size="sm">
                <strong>Total rows:</strong> {importResult.totalRows}<br/>
                <strong>Successfully imported:</strong> {importResult.successfulImports}<br/>
                <strong>Failed imports:</strong> {importResult.failedImports}
              </Text>
              
              {importResult.errors.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs">Errors:</Text>
                  <div className="max-h-32 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((error: any, index: number) => (
                      <Text key={index} size="xs" c="red">
                        Row {error.row}: {error.message}
                      </Text>
                    ))}
                    {importResult.errors.length > 10 && (
                      <Text size="xs" c="dimmed">
                        ... and {importResult.errors.length - 10} more errors
                      </Text>
                    )}
                  </div>
                </div>
              )}
            </Stack>
          </Alert>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={progress.stage === 'uploading' || progress.stage === 'importing'}
          >
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!file || progress.stage === 'uploading' || progress.stage === 'importing'}
              style={{
                backgroundColor: '#4362FF',
                color: 'white',
                border: 'none',
              }}
            >
              Import Experiences
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}

// Sample data generators for experiences
function generateSampleExperienceCSV(): string {
  const headers = [
    'title',
    'description',
    'location',
    'price_per_person',
    'duration_hours',
    'max_capacity',
    'category',
    'image_urls',
    'features',
    'rating',
    'reviews_count',
    'is_featured',
    'is_active',
  ];
  
  const sampleData = [
    {
      title: 'Lagos Nightlife Tour',
      description: 'Experience the vibrant nightlife of Lagos with visits to top clubs, bars, and entertainment venues.',
      location: 'Lagos',
      price_per_person: 25000,
      duration_hours: 6,
      max_capacity: 15,
      category: 'Nightlife',
      image_urls: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800;https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      features: 'Club entry; Professional guide; Transportation; Welcome drink',
      rating: 4.5,
      reviews_count: 23,
      is_featured: true,
      is_active: true,
    },
    {
      title: 'Abuja Cultural Heritage Walk',
      description: 'Explore the rich cultural heritage of Abuja through guided tours of historical sites and museums.',
      location: 'Abuja',
      price_per_person: 15000,
      duration_hours: 4,
      max_capacity: 20,
      category: 'Culture',
      image_urls: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800;https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      features: 'Museum entry; Cultural guide; Traditional lunch; Souvenir',
      rating: 4.8,
      reviews_count: 45,
      is_featured: true,
      is_active: true,
    },
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(exp => [
      `"${exp.title}"`,
      `"${exp.description}"`,
      `"${exp.location}"`,
      exp.price_per_person,
      exp.duration_hours,
      exp.max_capacity,
      `"${exp.category}"`,
      `"${exp.image_urls}"`,
      `"${exp.features}"`,
      exp.rating,
      exp.reviews_count,
      exp.is_featured,
      exp.is_active,
    ].join(',')),
  ].join('\n');
  
  return csvContent;
}

function generateSampleExperienceJSON(): string {
  const sampleData = [
    {
      title: 'Lagos Nightlife Tour',
      description: 'Experience the vibrant nightlife of Lagos with visits to top clubs, bars, and entertainment venues.',
      location: 'Lagos',
      price_per_person: 25000,
      duration_hours: 6,
      max_capacity: 15,
      category: 'Nightlife',
      image_urls: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      features: ['Club entry', 'Professional guide', 'Transportation', 'Welcome drink'],
      rating: 4.5,
      reviews_count: 23,
      is_featured: true,
      is_active: true,
    },
    {
      title: 'Abuja Cultural Heritage Walk',
      description: 'Explore the rich cultural heritage of Abuja through guided tours of historical sites and museums.',
      location: 'Abuja',
      price_per_person: 15000,
      duration_hours: 4,
      max_capacity: 20,
      category: 'Culture',
      image_urls: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      features: ['Museum entry', 'Cultural guide', 'Traditional lunch', 'Souvenir'],
      rating: 4.8,
      reviews_count: 45,
      is_featured: true,
      is_active: true,
    },
  ];
  
  return JSON.stringify(sampleData, null, 2);
}
