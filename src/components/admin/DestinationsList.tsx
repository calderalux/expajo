'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Group,
  Text,
  Badge,
  ActionIcon,
  Menu,
  TextInput,
  Select,
  Pagination,
  Stack,
  Checkbox,
  Alert,
  LoadingOverlay,
  Modal,
  Image,
  Grid,
  Title,
  Box,
  Flex
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconSearch, 
  IconFilter, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconDots,
  IconAlertCircle,
  IconMapPin,
  IconCalendar,
  IconLanguage,
  IconCurrencyDollar,
  IconStar,
  IconWorld
} from '@tabler/icons-react';
import { DestinationFormModal } from '@/components/forms/DestinationFormModal';
import { Database } from '@/types/database';
import { cn } from '@/utils/cn';

type Destination = Database['public']['Tables']['destinations']['Row'];

interface DestinationsListProps {
  onDestinationSelect?: (destination: Destination) => void;
}

interface FilterState {
  search: string;
  country: string;
  status: string;
  featured: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export function DestinationsList({ onDestinationSelect }: DestinationsListProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    country: '',
    status: '',
    featured: '',
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Modal states
  const [createModalOpen, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [deleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Load destinations
  const loadDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.country && { country: filters.country }),
        ...(filters.status && { status: filters.status }),
        ...(filters.featured && { featured: filters.featured }),
      });

      const response = await fetch(`/api/admin/destinations?${params}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setDestinations(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
      } else {
        setError(data.error || 'Failed to load destinations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Load destinations error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  // Handle destination creation
  const handleDestinationCreated = (destination: Destination) => {
    setDestinations(prev => [destination, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  };

  // Handle destination update
  const handleDestinationUpdated = (updatedDestination: Destination) => {
    setDestinations(prev => 
      prev.map(dest => dest.id === updatedDestination.id ? updatedDestination : dest)
    );
  };

  // Handle destination deletion
  const handleDeleteDestination = async () => {
    if (!selectedDestination) return;

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/destinations/${selectedDestination.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setDestinations(prev => prev.filter(dest => dest.id !== selectedDestination.id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        closeDeleteModal();
        setSelectedDestination(null);
      } else {
        setError(data.error || 'Failed to delete destination');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Delete destination error:', err);
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedDestinations.length === 0) return;

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/destinations/bulk', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedDestinations }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDestinations(prev => prev.filter(dest => !selectedDestinations.includes(dest.id)));
        setPagination(prev => ({ ...prev, total: prev.total - selectedDestinations.length }));
        setSelectedDestinations([]);
      } else {
        setError(data.error || 'Failed to delete destinations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Bulk delete error:', err);
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedDestinations.length === 0) return;

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/destinations/bulk', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ids: selectedDestinations, 
          updates: { is_published: publish } 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDestinations(prev => 
          prev.map(dest => 
            selectedDestinations.includes(dest.id) 
              ? { ...dest, is_published: publish }
              : dest
          )
        );
        setSelectedDestinations([]);
      } else {
        setError(data.error || 'Failed to update destinations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Bulk publish error:', err);
    }
  };

  // Get unique countries for filter
  const countries = Array.from(new Set(destinations.map(d => d.country))).sort();

  const rows = destinations.map((destination) => (
    <Table.Tr key={destination.id}>
      <Table.Td>
        <Checkbox
          checked={selectedDestinations.includes(destination.id)}
          onChange={(event) => {
            if (event.currentTarget.checked) {
              setSelectedDestinations(prev => [...prev, destination.id]);
            } else {
              setSelectedDestinations(prev => prev.filter(id => id !== destination.id));
            }
          }}
        />
      </Table.Td>
      <Table.Td>
        <div className="flex items-center gap-3">
          {destination.image_cover_url ? (
            <Image
              src={destination.image_cover_url}
              alt={destination.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
              fallbackSrc="/placeholder-image.jpg"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <IconMapPin size={20} className="text-gray-400" />
            </div>
          )}
          <div>
            <Text fw={500} size="sm">{destination.name}</Text>
            <Text size="xs" c="dimmed">{destination.country}</Text>
          </div>
        </div>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{destination.region || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {destination.featured && (
            <Badge color="yellow" size="xs" variant="light">
              <IconStar size={10} className="mr-1" />
              Featured
            </Badge>
          )}
          <Badge 
            color={destination.is_published ? 'green' : 'gray'} 
            size="xs" 
            variant="light"
          >
            {destination.is_published ? 'Published' : 'Draft'}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{destination.package_count || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{destination.avg_rating ? destination.avg_rating.toFixed(1) : '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => {
              setSelectedDestination(destination);
              onDestinationSelect?.(destination);
            }}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => {
              setSelectedDestination(destination);
              openEditModal();
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            color="red"
            onClick={() => {
              setSelectedDestination(destination);
              openDeleteModal();
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title order={2} className="text-gray-900 font-playfair">
            Destinations
          </Title>
          <Text size="sm" c="dimmed">
            Manage travel destinations and their details
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}
          className="bg-gradient-to-r from-primary to-secondary text-white"
        >
          Add Destination
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <TextInput
              placeholder="Search destinations..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Filter by country"
              data={countries.map(country => ({ value: country, label: country }))}
              value={filters.country}
              onChange={(value) => setFilters(prev => ({ ...prev, country: value || '' }))}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Filter by featured"
              data={[
                { value: 'featured', label: 'Featured' },
                { value: 'not-featured', label: 'Not Featured' },
              ]}
              value={filters.featured}
              onChange={(value) => setFilters(prev => ({ ...prev, featured: value || '' }))}
              clearable
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Bulk Actions */}
      {selectedDestinations.length > 0 && (
        <Card>
          <Group justify="space-between">
            <Text size="sm">
              {selectedDestinations.length} destination(s) selected
            </Text>
            <Group gap="xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkPublish(true)}
              >
                Publish Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkPublish(false)}
              >
                Unpublish Selected
              </Button>
              <Button
                variant="outline"
                color="red"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </Group>
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

      {/* Table */}
      <Card className="relative">
        <LoadingOverlay visible={loading} />
        <div className="overflow-x-auto">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={selectedDestinations.length === destinations.length && destinations.length > 0}
                    indeterminate={selectedDestinations.length > 0 && selectedDestinations.length < destinations.length}
                    onChange={(event) => {
                      if (event.currentTarget.checked) {
                        setSelectedDestinations(destinations.map(d => d.id));
                      } else {
                        setSelectedDestinations([]);
                      }
                    }}
                  />
                </Table.Th>
                <Table.Th>Destination</Table.Th>
                <Table.Th>Region</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Packages</Table.Th>
                <Table.Th>Rating</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <div className="text-center py-8">
                      <IconWorld size={48} className="mx-auto text-gray-300 mb-4" />
                      <Text c="dimmed">No destinations found</Text>
                    </div>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center mt-6">
            <Pagination
              value={pagination.page}
              onChange={(page) => setPagination(prev => ({ ...prev, page }))}
              total={Math.ceil(pagination.total / pagination.limit)}
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      <DestinationFormModal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        onSuccess={handleDestinationCreated}
        mode="create"
      />

      <DestinationFormModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSuccess={handleDestinationUpdated}
        destination={selectedDestination}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Destination"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete &quot;{selectedDestination?.name}&quot;? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteDestination}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
