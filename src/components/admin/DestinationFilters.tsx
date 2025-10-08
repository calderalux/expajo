'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Select,
  MultiSelect,
  NumberInput,
  Switch,
  Divider,
  Alert,
  LoadingOverlay,
  Card,
  Title,
  Badge,
  ActionIcon,
  ScrollArea,
  Checkbox,
  Box,
  Flex,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import {
  IconFilter,
  IconX,
  IconSearch,
  IconCalendar,
  IconMapPin,
  IconStar,
  IconWorld,
  IconCurrencyDollar,
  IconTrendingUp,
  IconSettings,
  IconRefresh,
  IconDownload,
  IconUpload,
} from '@tabler/icons-react';
import { cn } from '@/utils/cn';

interface AdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

interface FilterState {
  search: string;
  country: string[];
  region: string[];
  status: string[];
  featured: boolean | null;
  currency: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  ratingRange: {
    min: number | null;
    max: number | null;
  };
  packageCountRange: {
    min: number | null;
    max: number | null;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'country', label: 'Country' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'package_count', label: 'Package Count' },
  { value: 'avg_rating', label: 'Average Rating' },
  { value: 'review_count', label: 'Review Count' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'NGN', label: 'NGN' },
];

export function AdvancedFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      search: '',
      country: [],
      region: [],
      status: [],
      featured: null,
      currency: [],
      dateRange: { from: null, to: null },
      ratingRange: { min: null, max: null },
      packageCountRange: { min: null, max: null },
      sortBy: 'name',
      sortOrder: 'asc',
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      await onApplyFilters(filters);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      country: [],
      region: [],
      status: [],
      featured: null,
      currency: [],
      dateRange: { from: null, to: null },
      ratingRange: { min: null, max: null },
      packageCountRange: { min: null, max: null },
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.country.length > 0) count++;
    if (filters.region.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.featured !== null) count++;
    if (filters.currency.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.ratingRange.min !== null || filters.ratingRange.max !== null)
      count++;
    if (
      filters.packageCountRange.min !== null ||
      filters.packageCountRange.max !== null
    )
      count++;
    return count;
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconFilter size={20} />
          <Text fw={500}>Advanced Filters</Text>
          {getActiveFiltersCount() > 0 && (
            <Badge size="sm" variant="filled">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Group>
      }
      size="lg"
      centered
    >
      <div className="relative">
        <LoadingOverlay visible={isLoading} />

        <Stack gap="lg">
          {/* Search */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Search
            </Text>
            <TextInput
              placeholder="Search destinations..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          {/* Location Filters */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Location
            </Text>
            <Group grow>
              <MultiSelect
                placeholder="Select countries"
                data={[]} // Will be populated from API
                value={filters.country}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, country: value }))
                }
                searchable
                clearable
                leftSection={<IconMapPin size={16} />}
              />
              <MultiSelect
                placeholder="Select regions"
                data={[]} // Will be populated from API
                value={filters.region}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, region: value }))
                }
                searchable
                clearable
                leftSection={<IconWorld size={16} />}
              />
            </Group>
          </div>

          {/* Status Filters */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Status & Features
            </Text>
            <Group grow>
              <MultiSelect
                placeholder="Select status"
                data={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                ]}
                value={filters.status}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
                clearable
              />
              <Select
                placeholder="Featured status"
                data={[
                  { value: 'true', label: 'Featured' },
                  { value: 'false', label: 'Not Featured' },
                ]}
                value={
                  filters.featured === null ? null : filters.featured.toString()
                }
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    featured: value === null ? null : value === 'true',
                  }))
                }
                clearable
                leftSection={<IconStar size={16} />}
              />
            </Group>
          </div>

          {/* Currency */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Currency
            </Text>
            <MultiSelect
              placeholder="Select currencies"
              data={CURRENCY_OPTIONS}
              value={filters.currency}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, currency: value }))
              }
              clearable
              leftSection={<IconCurrencyDollar size={16} />}
            />
          </div>

          {/* Date Range */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Date Range
            </Text>
            <Group grow>
              <DatePicker
                value={
                  filters.dateRange.from
                    ? filters.dateRange.from.toISOString().split('T')[0]
                    : null
                }
                onChange={(value: string | null) => {
                  const date = value ? new Date(value) : null;
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: date },
                  }));
                }}
                minDate={dayjs().add(1, 'day').toDate()}
              />
              <DatePicker
                value={
                  filters.dateRange.to
                    ? filters.dateRange.to.toISOString().split('T')[0]
                    : null
                }
                onChange={(value: string | null) => {
                  const date = value ? new Date(value) : null;
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: date },
                  }));
                }}
                minDate={dayjs().add(1, 'day').toDate()}
              />
            </Group>
          </div>

          {/* Rating Range */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Rating Range
            </Text>
            <Group grow>
              <NumberInput
                placeholder="Min rating"
                min={0}
                max={5}
                step={0.1}
                value={filters.ratingRange.min || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    ratingRange: {
                      ...prev.ratingRange,
                      min: typeof value === 'number' ? value : null,
                    },
                  }))
                }
                leftSection={<IconStar size={16} />}
              />
              <NumberInput
                placeholder="Max rating"
                min={0}
                max={5}
                step={0.1}
                value={filters.ratingRange.max || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    ratingRange: {
                      ...prev.ratingRange,
                      max: typeof value === 'number' ? value : null,
                    },
                  }))
                }
                leftSection={<IconStar size={16} />}
              />
            </Group>
          </div>

          {/* Package Count Range */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Package Count Range
            </Text>
            <Group grow>
              <NumberInput
                placeholder="Min packages"
                min={0}
                value={filters.packageCountRange.min || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    packageCountRange: {
                      ...prev.packageCountRange,
                      min: typeof value === 'number' ? value : null,
                    },
                  }))
                }
                leftSection={<IconTrendingUp size={16} />}
              />
              <NumberInput
                placeholder="Max packages"
                min={0}
                value={filters.packageCountRange.max || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    packageCountRange: {
                      ...prev.packageCountRange,
                      max: typeof value === 'number' ? value : null,
                    },
                  }))
                }
                leftSection={<IconTrendingUp size={16} />}
              />
            </Group>
          </div>

          {/* Sorting */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Sorting
            </Text>
            <Group grow>
              <Select
                placeholder="Sort by"
                data={SORT_OPTIONS}
                value={filters.sortBy}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value || 'name' }))
                }
              />
              <Select
                placeholder="Order"
                data={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' },
                ]}
                value={filters.sortOrder}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: value as 'asc' | 'desc',
                  }))
                }
              />
            </Group>
          </div>

          <Divider />

          {/* Actions */}
          <Group justify="space-between">
            <Button
              variant="outline"
              leftSection={<IconRefresh size={16} />}
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
            <Group gap="sm">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </Group>
          </Group>
        </Stack>
      </div>
    </Modal>
  );
}

// Bulk Operations Modal
interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onBulkPublish: (publish: boolean) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onBulkImport: (file: File) => void;
}

export function BulkOperationsModal({
  isOpen,
  onClose,
  selectedCount,
  onBulkPublish,
  onBulkDelete,
  onBulkExport,
  onBulkImport,
}: BulkOperationsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [operation, setOperation] = useState<string | null>(null);

  const handleOperation = async (op: string) => {
    setIsLoading(true);
    setOperation(op);

    try {
      switch (op) {
        case 'publish':
          await onBulkPublish(true);
          break;
        case 'unpublish':
          await onBulkPublish(false);
          break;
        case 'delete':
          await onBulkDelete();
          break;
        case 'export':
          await onBulkExport();
          break;
      }
      onClose();
    } finally {
      setIsLoading(false);
      setOperation(null);
    }
  };

  const handleFileUpload = (file: File) => {
    onBulkImport(file);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Bulk Operations (${selectedCount} selected)`}
      centered
    >
      <div className="relative">
        <LoadingOverlay visible={isLoading} />

        <Stack gap="md">
          <Alert
            icon={<IconSettings size={16} />}
            title="Bulk Operations"
            variant="light"
          >
            You have {selectedCount} destination(s) selected. Choose an
            operation to perform.
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              leftSection={<IconUpload size={16} />}
              onClick={() => handleOperation('publish')}
              loading={operation === 'publish'}
            >
              Publish Selected
            </Button>
            <Button
              variant="outline"
              leftSection={<IconX size={16} />}
              onClick={() => handleOperation('unpublish')}
              loading={operation === 'unpublish'}
            >
              Unpublish Selected
            </Button>
            <Button
              variant="outline"
              color="red"
              leftSection={<IconX size={16} />}
              onClick={() => handleOperation('delete')}
              loading={operation === 'delete'}
            >
              Delete Selected
            </Button>
            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              onClick={() => handleOperation('export')}
              loading={operation === 'export'}
            >
              Export Selected
            </Button>
          </div>

          <Divider />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Import Destinations
            </Text>
            <input
              type="file"
              accept=".csv,.json,.xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <Text size="xs" c="dimmed" mt="xs">
              Supported formats: CSV, JSON, Excel
            </Text>
          </div>

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </div>
    </Modal>
  );
}

// Quick Actions Toolbar
interface QuickActionsToolbarProps {
  selectedCount: number;
  onAdvancedFilter: () => void;
  onBulkOperations: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function QuickActionsToolbar({
  selectedCount,
  onAdvancedFilter,
  onBulkOperations,
  onRefresh,
  onExport,
  onImport,
}: QuickActionsToolbarProps) {
  return (
    <Card>
      <Group justify="space-between">
        <Group gap="sm">
          <Button
            variant="outline"
            leftSection={<IconFilter size={16} />}
            onClick={onAdvancedFilter}
          >
            Advanced Filters
          </Button>
          <Button
            variant="outline"
            leftSection={<IconSettings size={16} />}
            onClick={onBulkOperations}
            disabled={selectedCount === 0}
          >
            Bulk Operations ({selectedCount})
          </Button>
        </Group>

        <Group gap="sm">
          <ActionIcon variant="outline" onClick={onRefresh} title="Refresh">
            <IconRefresh size={16} />
          </ActionIcon>
          <ActionIcon variant="outline" onClick={onExport} title="Export">
            <IconDownload size={16} />
          </ActionIcon>
          <ActionIcon variant="outline" onClick={onImport} title="Import">
            <IconUpload size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
