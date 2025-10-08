'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 size={24} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-yellow-600" />;
      case 'info':
        return <Info size={24} className="text-blue-600" />;
      default:
        return <AlertTriangle size={24} className="text-red-600" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
        return 'blue';
      default:
        return 'red';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      maxHeight="90vh"
    >
      <div className="text-center px-6 py-8">
        <div className="flex justify-center mb-6">
          {getIcon()}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            color={getButtonColor()}
            onClick={onConfirm}
            isLoading={isLoading}
            className="px-6"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
