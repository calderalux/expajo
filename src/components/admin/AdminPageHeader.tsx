'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, Download, FileText } from 'lucide-react';

export interface AdminPageHeaderProps {
  title: string;
  description: string;
  totalCount?: number;
  canCreate?: boolean;
  onCreate?: () => void;
  createButtonText?: string;
  showImport?: boolean;
  onImport?: () => void;
  showExport?: boolean;
  onExport?: () => void;
  showSamples?: boolean;
  onDownloadSample?: (format: 'csv' | 'json') => void;
  sampleFileName?: string;
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  totalCount,
  canCreate = false,
  onCreate,
  createButtonText = 'Add Item',
  showImport = false,
  onImport,
  showExport = false,
  onExport,
  showSamples = false,
  onDownloadSample,
  sampleFileName = 'sample',
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {description}
            {totalCount !== undefined && ` (${totalCount} total)`}
          </p>
        </div>
        <div className="flex gap-3">
          {/* Import & Export Actions */}
          {(showImport || showExport) && (
            <div className="flex gap-2">
              {showImport && (
                <Button
                  variant="outline"
                  onClick={onImport}
                  className="flex items-center gap-2"
                  disabled={!canCreate}
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              )}
              {showExport && (
                <Button
                  variant="outline"
                  onClick={onExport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              )}
            </div>
          )}

          {/* Sample Downloads */}
          {showSamples && onDownloadSample && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadSample('csv')}
                className="flex items-center gap-1"
                title={`Download ${sampleFileName} CSV Sample`}
              >
                <FileText className="w-3 h-3" />
                CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadSample('json')}
                className="flex items-center gap-1"
                title={`Download ${sampleFileName} JSON Sample`}
              >
                <FileText className="w-3 h-3" />
                JSON
              </Button>
            </div>
          )}

          {/* Create Button */}
          {canCreate && onCreate && (
            <Button onClick={onCreate} leftIcon={<Plus size={20} />}>
              {createButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
