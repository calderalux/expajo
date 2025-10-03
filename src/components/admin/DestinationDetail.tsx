'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Grid,
  Group,
  Text,
  Badge,
  Button,
  Image,
  Stack,
  Divider,
  ActionIcon,
  Modal,
  Alert,
  LoadingOverlay,
  Tabs,
  Table,
  Title,
  Box,
  Flex,
  Avatar,
  Timeline,
  Progress,
  RingProgress,
  Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconEdit,
  IconTrash,
  IconMapPin,
  IconCalendar,
  IconLanguage,
  IconCurrencyDollar,
  IconStar,
  IconWorld,
  IconUsers,
  IconTrendingUp,
  IconEye,
  IconAlertCircle,
  IconPackage,
  IconHeart,
  IconShare,
  IconDownload,
  IconRefresh,
  IconSettings
} from '@tabler/icons-react';
import { DestinationFormModal } from '@/components/forms/DestinationFormModal';
import { Database } from '@/types/database';
import { cn } from '@/utils/cn';

type Destination = Database['public']['Tables']['destinations']['Row'];
type Package = Database['public']['Tables']['packages']['Row'];

interface DestinationDetailProps {
  destinationId: string;
  onBack?: () => void;
}

export function DestinationDetail({ destinationId, onBack }: DestinationDetailProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [deleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  // Load destination details
  const loadDestination = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/destinations/${destinationId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setDestination(data.data);
      } else {
        setError(data.error || 'Failed to load destination');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Load destination error:', err);
    } finally {
      setLoading(false);
    }
  }, [destinationId]);

  // Load packages for this destination
  const loadPackages = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/destinations/${destinationId}/packages`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data);
      }
    } catch (err) {
      console.error('Load packages error:', err);
    }
  }, [destinationId]);

  useEffect(() => {
    if (destinationId) {
      loadDestination();
      loadPackages();
    }
  }, [destinationId, loadDestination, loadPackages]);

  // Handle destination update
  const handleDestinationUpdated = (updatedDestination: Destination) => {
    setDestination(updatedDestination);
  };

  // Handle destination deletion
  const handleDeleteDestination = async () => {
    if (!destination) return;

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/destinations/${destination.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        onBack?.();
      } else {
        setError(data.error || 'Failed to delete destination');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Delete destination error:', err);
    }
  };

  if (loading) {
    return (
      <Card className="relative">
        <LoadingOverlay visible />
        <div className="h-96" />
      </Card>
    );
  }

  if (error || !destination) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        variant="light"
      >
        {error || 'Destination not found'}
      </Alert>
    );
  }

  const imageGallery = destination.image_gallery || [];
  const highlights = destination.highlights || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Group justify="space-between" align="flex-start">
          <div className="flex-1">
            <Group gap="md" mb="md">
              <Button
                variant="outline"
                leftSection={<IconWorld size={16} />}
                onClick={onBack}
              >
                Back to Destinations
              </Button>
              <Group gap="xs">
                <Button
                  variant="outline"
                  leftSection={<IconEdit size={16} />}
                  onClick={openEditModal}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={openDeleteModal}
                >
                  Delete
                </Button>
              </Group>
            </Group>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover Image */}
              <div className="sm:w-80 flex-shrink-0">
                {destination.image_cover_url ? (
                  <Image
                    src={destination.image_cover_url}
                    alt={destination.name}
                    height={200}
                    className="rounded-lg object-cover"
                    fallbackSrc="/placeholder-image.jpg"
                  />
                ) : (
                  <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <IconMapPin size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <Group gap="md" mb="md">
                  <Title order={2} className="text-gray-900 font-playfair">
                    {destination.name}
                  </Title>
                  <Group gap="xs">
                    {destination.featured && (
                      <Badge color="yellow" variant="light">
                        <IconStar size={12} className="mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge 
                      color={destination.is_published ? 'green' : 'gray'} 
                      variant="light"
                    >
                      {destination.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </Group>
                </Group>

                <Stack gap="sm">
                  <Group gap="md">
                    <Group gap="xs">
                      <IconMapPin size={16} className="text-gray-500" />
                      <Text size="sm">{destination.country}</Text>
                    </Group>
                    {destination.region && (
                      <Group gap="xs">
                        <IconWorld size={16} className="text-gray-500" />
                        <Text size="sm">{destination.region}</Text>
                      </Group>
                    )}
                  </Group>

                  {destination.best_time_to_visit && (
                    <Group gap="xs">
                      <IconCalendar size={16} className="text-gray-500" />
                      <Text size="sm">{destination.best_time_to_visit}</Text>
                    </Group>
                  )}

                  {destination.language && (
                    <Group gap="xs">
                      <IconLanguage size={16} className="text-gray-500" />
                      <Text size="sm">{destination.language}</Text>
                    </Group>
                  )}

                  {destination.currency && (
                    <Group gap="xs">
                      <IconCurrencyDollar size={16} className="text-gray-500" />
                      <Text size="sm">{destination.currency}</Text>
                    </Group>
                  )}
                </Stack>

                {destination.description && (
                  <Text size="sm" c="dimmed" className="mt-4">
                    {destination.description}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </Group>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconEye size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="packages" leftSection={<IconPackage size={16} />}>
            Packages ({packages.length})
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconTrendingUp size={16} />}>
            Analytics
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            Settings
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview" className="mt-6">
          <Grid>
            {/* Highlights */}
            {highlights.length > 0 && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card>
                  <Title order={4} mb="md">Highlights</Title>
                  <Stack gap="sm">
                    {highlights.map((highlight: any, index: number) => (
                      <Group key={index} gap="sm">
                        <IconStar size={16} className="text-yellow-500" />
                        <Text size="sm">{highlight}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>
            )}

            {/* Climate & Language */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card>
                <Title order={4} mb="md">Travel Information</Title>
                <Stack gap="md">
                  {destination.climate && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">Climate</Text>
                      <Text size="sm" c="dimmed">{destination.climate}</Text>
                    </div>
                  )}
                  {destination.language && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">Language</Text>
                      <Text size="sm" c="dimmed">{destination.language}</Text>
                    </div>
                  )}
                  {destination.best_time_to_visit && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">Best Time to Visit</Text>
                      <Text size="sm" c="dimmed">{destination.best_time_to_visit}</Text>
                    </div>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Image Gallery */}
            {imageGallery.length > 0 && (
              <Grid.Col span={12}>
                <Card>
                  <Title order={4} mb="md">Image Gallery</Title>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageGallery.map((url: string, index: number) => (
                      <Image
                        key={index}
                        src={url}
                        alt={`Gallery image ${index + 1}`}
                        height={120}
                        className="rounded-lg object-cover"
                        fallbackSrc="/placeholder-image.jpg"
                      />
                    ))}
                  </div>
                </Card>
              </Grid.Col>
            )}
          </Grid>
        </Tabs.Panel>

        {/* Packages Tab */}
        <Tabs.Panel value="packages" className="mt-6">
          <Card>
            <Group justify="space-between" mb="md">
              <Title order={4}>Packages</Title>
              <Button
                variant="outline"
                leftSection={<IconPackage size={16} />}
                onClick={() => {/* Navigate to create package */}}
              >
                Add Package
              </Button>
            </Group>

            {packages.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Package</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Duration</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {packages.map((pkg) => (
                      <Table.Tr key={pkg.id}>
                        <Table.Td>
                          <div>
                            <Text fw={500} size="sm">{pkg.title}</Text>
                            <Text size="xs" c="dimmed">{pkg.summary}</Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {pkg.category}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{pkg.duration_days} days</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {pkg.currency} {pkg.base_price.toLocaleString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={pkg.is_published ? 'green' : 'gray'} 
                            variant="light"
                            size="sm"
                          >
                            {pkg.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon variant="subtle" size="sm">
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" size="sm">
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <IconPackage size={48} className="mx-auto text-gray-300 mb-4" />
                <Text c="dimmed">No packages found for this destination</Text>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {/* Navigate to create package */}}
                >
                  Create First Package
                </Button>
              </div>
            )}
          </Card>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics" className="mt-6">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card>
                <Title order={4} mb="md">Performance Metrics</Title>
                <Stack gap="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Package Count</Text>
                      <Text size="sm" fw={500}>{destination.package_count || 0}</Text>
                    </Group>
                    <Progress value={Math.min((destination.package_count || 0) * 10, 100)} />
                  </div>
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Average Rating</Text>
                      <Text size="sm" fw={500}>
                        {destination.avg_rating ? destination.avg_rating.toFixed(1) : 'N/A'}
                      </Text>
                    </Group>
                    <Progress value={(destination.avg_rating || 0) * 20} />
                  </div>
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Review Count</Text>
                      <Text size="sm" fw={500}>{destination.review_count || 0}</Text>
                    </Group>
                    <Progress value={Math.min((destination.review_count || 0) * 2, 100)} />
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card>
                <Title order={4} mb="md">Status Overview</Title>
                <Center>
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: destination.is_published ? 100 : 0, color: 'green' },
                      { value: destination.featured ? 100 : 0, color: 'yellow' },
                    ]}
                    label={
                      <div className="text-center">
                        <Text size="xs" c="dimmed">Status</Text>
                        <Text size="lg" fw={500}>
                          {destination.is_published ? 'Live' : 'Draft'}
                        </Text>
                      </div>
                    }
                  />
                </Center>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" className="mt-6">
          <Card>
            <Title order={4} mb="md">Destination Settings</Title>
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={500}>Published Status</Text>
                  <Text size="xs" c="dimmed">Make this destination visible to the public</Text>
                </div>
                <Badge 
                  color={destination.is_published ? 'green' : 'gray'} 
                  variant="light"
                >
                  {destination.is_published ? 'Published' : 'Draft'}
                </Badge>
              </Group>
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={500}>Featured Status</Text>
                  <Text size="xs" c="dimmed">Show this destination prominently on the homepage</Text>
                </div>
                <Badge 
                  color={destination.featured ? 'yellow' : 'gray'} 
                  variant="light"
                >
                  {destination.featured ? 'Featured' : 'Not Featured'}
                </Badge>
              </Group>
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={500}>Slug</Text>
                  <Text size="xs" c="dimmed">URL-friendly identifier</Text>
                </div>
                <Text size="sm" className="font-mono">{destination.slug || '-'}</Text>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Modals */}
      <DestinationFormModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSuccess={handleDestinationUpdated}
        destination={destination}
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
            Are you sure you want to delete &quot;{destination.name}&quot;? This action cannot be undone.
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
