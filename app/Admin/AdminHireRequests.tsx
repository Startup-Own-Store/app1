import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import supabase from '../../SupabaseClient';

interface HireRequest {
  id: string;
  user_id: string;
  service_name: string;
  service_category: string;
  full_name: string;
  phone_number: string;
  address_type: string;
  address_line: string;
  job_description: string;
  is_consultancy: boolean;
  is_custom_request: boolean;
  status: string;
  created_at: string;
  image_urls?: string[];
  user_email?: string;
}

const AdminHireRequests = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  useEffect(() => {
    fetchHireRequests();
  }, []);

  const fetchHireRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching hire requests from Supabase...');
      
      // First, let's check if we can access the table at all
      const { count, error: countError } = await supabase
        .from('user_hire_requests')
        .select('*', { count: 'exact', head: true });
      
      console.log('Table row count:', count);
      if (countError) {
        console.error('Count error:', countError);
      }
      
      const { data, error } = await supabase
        .from('user_hire_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hire requests:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        Alert.alert('Error', 'Failed to fetch hire requests: ' + error.message);
        return;
      }

      console.log('Fetched hire requests count:', data?.length || 0);
      console.log('Fetched hire requests:', JSON.stringify(data, null, 2));
      console.log('Sample request:', data?.[0]);
      
      // Enhanced data mapping with better error handling
      const requestsWithEmails = (data || []).map((request) => ({
        ...request,
        user_email: request.user_id ? `User: ${request.user_id.substring(0, 8)}...` : 'Guest User',
        // Ensure all required fields have values
        service_type: request.service_name || request.service_category || 'Unknown Service',
        address: request.address_line || 'Address not specified',
        job_description: request.job_description || 'No description provided',
        full_name: request.full_name || 'Not provided',
        phone_number: request.phone_number || 'Not provided',
      }));

      setRequests(requestsWithEmails);
      
      if (data?.length === 0) {
        console.log('No hire requests found in the database');
      }
      
    } catch (error) {
      console.error('Exception fetching hire requests:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHireRequests();
  };

  const handleViewDetails = (request: HireRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const clearSelection = () => {
    setSelectedRequestIds([]);
    setSelectionMode(false);
  };

  const startSelection = (requestId: string) => {
    setSelectionMode(true);
    setSelectedRequestIds([requestId]);
  };

  const toggleSelection = (requestId: string) => {
    setSelectionMode(true);
    setSelectedRequestIds(prev => {
      const exists = prev.includes(requestId);
      if (exists) {
        return prev.filter(id => id !== requestId);
      }
      return [...prev, requestId];
    });
  };

  const selectedCount = selectedRequestIds.length;

  useEffect(() => {
    if (selectionMode && selectedCount === 0) {
      setSelectionMode(false);
    }
  }, [selectionMode, selectedCount]);

  const deleteRequests = async (ids: string[]) => {
    if (!ids.length) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_hire_requests')
        .delete()
        .in('id', ids);

      if (error) {
        throw error;
      }

      setRequests(prev => prev.filter(req => !ids.includes(req.id)));

      if (selectedRequest && ids.includes(selectedRequest.id)) {
        setModalVisible(false);
        setSelectedRequest(null);
      }

      clearSelection();
      Alert.alert('Deleted', ids.length === 1 ? 'Request deleted successfully.' : `${ids.length} requests deleted successfully.`);
    } catch (error) {
      console.error('Error deleting requests:', error);
      Alert.alert('Error', 'Failed to delete request(s). Please try again.');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedCount) {
      clearSelection();
      return;
    }

    Alert.alert(
      'Delete Requests',
      `Are you sure you want to delete ${selectedCount} request${selectedCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: clearSelection },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRequests(selectedRequestIds),
        },
      ],
    );
  };

  const handleDeleteSingle = (requestId: string) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRequests([requestId]),
        },
      ],
    );
  };

  const handleCopyPhone = async (phoneNumber?: string) => {
    if (!phoneNumber) {
      Alert.alert('Unavailable', 'No phone number to copy.');
      return;
    }

    try {
      await Clipboard.setStringAsync(phoneNumber);
      Alert.alert('Copied', 'Phone number copied to clipboard.');
    } catch (error) {
      console.error('Clipboard error:', error);
      Alert.alert('Error', 'Unable to copy phone number.');
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_hire_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      
      // Update selected request if it's the one being modified
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
      }

      Alert.alert('Success', `Request ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const handleStatusChange = (requestId: string, newStatus: string) => {
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to mark this request as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => updateRequestStatus(requestId, newStatus)
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return '#f39c12'; // Orange
      case 'accepted':
      case 'approved':
        return '#27ae60'; // Green
      case 'rejected':
      case 'cancelled':
        return '#e74c3c'; // Red
      case 'completed':
      case 'done':
        return '#3498db'; // Blue
      case 'in_progress':
        return '#9b59b6'; // Purple
      default:
        return '#95a5a6'; // Gray
    }
  };

  const getStatusDisplayText = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderRequestCard = ({ item }: { item: HireRequest }) => {
    const isSelected = selectedRequestIds.includes(item.id);

    const handlePress = () => {
      if (selectionMode) {
        toggleSelection(item.id);
        return;
      }
      handleViewDetails(item);
    };

    const handleLongPress = () => {
      if (selectionMode) {
        toggleSelection(item.id);
      } else {
        startSelection(item.id);
      }
    };

    return (
      <TouchableOpacity
        style={[styles.card, selectionMode && styles.cardSelectable, isSelected && styles.cardSelected]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={250}
        activeOpacity={0.85}
      >
      <View style={styles.cardHeader}>
        <View style={styles.serviceTypeContainer}>
          <MaterialIcons 
            name={getServiceIcon(item.service_name)} 
            size={20} 
            color="#2980b9" 
          />
          <Text style={styles.serviceType} numberOfLines={1}>
            {item.service_name || item.service_category}
          </Text>
        </View>
        {selectionMode ? (
          <View style={[styles.selectionBadge, isSelected ? styles.selectionBadgeSelected : styles.selectionBadgeUnselected]}>
            <MaterialIcons
              name={isSelected ? 'check' : 'radio-button-unchecked'}
              size={16}
              color={isSelected ? '#fff' : '#7f8c8d'}
            />
          </View>
        ) : (
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusDisplayText(item.status)}</Text>
        </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#7f8c8d" />
          <Text style={styles.infoText}>{item.full_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={16} color="#7f8c8d" />
          <Text style={styles.infoText}>{item.phone_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#7f8c8d" />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.address_type}: {item.address_line}
          </Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.is_consultancy && (
            <View style={[styles.tag, styles.consultancyTag]}>
              <Text style={styles.tagText}>Consultancy</Text>
            </View>
          )}
          {item.is_custom_request && (
            <View style={[styles.tag, styles.customTag]}>
              <Text style={styles.tagText}>Custom Request</Text>
            </View>
          )}
          {item.image_urls && item.image_urls.length > 0 && (
            <View style={[styles.tag, styles.imagesTag]}>
              <MaterialIcons name="photo" size={12} color="#fff" />
              <Text style={styles.tagText}>{item.image_urls.length} photo(s)</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        {!selectionMode && (
          <MaterialIcons name="chevron-right" size={20} color="#3498db" />
        )}
      </View>
      </TouchableOpacity>
    );
  };

  const getServiceIcon = (serviceName: string) => {
    const service = serviceName?.toLowerCase();
    if (service?.includes('electric')) return 'electrical-services';
    if (service?.includes('plumb')) return 'plumbing';
    if (service?.includes('doctor') || service?.includes('medical')) return 'medical-services';
    if (service?.includes('tutor') || service?.includes('teacher')) return 'school';
    if (service?.includes('consult')) return 'psychology';
    if (service?.includes('clean') || service?.includes('maid')) return 'cleaning-services';
    return 'work-outline';
  };

  const renderDetailsModal = () => {
    if (!selectedRequest) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={28} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Service Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Service Information</Text>
                <View style={styles.serviceInfo}>
                  <MaterialIcons 
                    name={getServiceIcon(selectedRequest.service_name)} 
                    size={24} 
                    color="#2980b9" 
                  />
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceName}>{selectedRequest.service_name}</Text>
                    <Text style={styles.serviceCategory}>{selectedRequest.service_category}</Text>
                  </View>
                </View>
              </View>

              {/* Status Section with Actions */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusSection}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) }]}>
                    <Text style={styles.statusText}>{getStatusDisplayText(selectedRequest.status)}</Text>
                  </View>
                  
                  <View style={styles.statusActions}>
                    {selectedRequest.status.toLowerCase() === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={[styles.statusButton, styles.acceptButton]}
                          onPress={() => handleStatusChange(selectedRequest.id, 'accepted')}
                        >
                          <Text style={styles.statusButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.statusButton, styles.rejectButton]}
                          onPress={() => handleStatusChange(selectedRequest.id, 'rejected')}
                        >
                          <Text style={styles.statusButtonText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {selectedRequest.status.toLowerCase() === 'accepted' && (
                      <TouchableOpacity
                        style={[styles.statusButton, styles.completeButton]}
                        onPress={() => handleStatusChange(selectedRequest.id, 'completed')}
                      >
                        <Text style={styles.statusButtonText}>Mark Complete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Customer Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Customer Information</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Full Name</Text>
                    <Text style={styles.infoItemValue}>{selectedRequest.full_name}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Phone</Text>
                    <View style={styles.infoItemValueRow}>
                      <Text style={styles.infoItemValue}>{selectedRequest.phone_number}</Text>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => handleCopyPhone(selectedRequest.phone_number)}
                      >
                        <MaterialIcons name="content-copy" size={16} color="#2980b9" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>User ID</Text>
                    <Text style={[styles.infoItemValue, styles.userId]}>{selectedRequest.user_id}</Text>
                  </View>
                </View>
              </View>

              {/* Address Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Address</Text>
                <View style={styles.addressContainer}>
                  <MaterialIcons name="location-on" size={20} color="#7f8c8d" />
                  <View style={styles.addressText}>
                    <Text style={styles.addressType}>{selectedRequest.address_type}</Text>
                    <Text style={styles.addressLine}>{selectedRequest.address_line}</Text>
                  </View>
                </View>
              </View>

              {/* Job Description */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Job Description</Text>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>
                    {selectedRequest.job_description}
                  </Text>
                </View>
              </View>

              {/* Request Type Tags */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Request Type</Text>
                <View style={styles.tagsContainer}>
                  {selectedRequest.is_consultancy && (
                    <View style={[styles.detailTag, styles.consultancyTag]}>
                      <MaterialIcons name="psychology" size={16} color="#fff" />
                      <Text style={styles.detailTagText}>Consultancy Service</Text>
                    </View>
                  )}
                  {selectedRequest.is_custom_request && (
                    <View style={[styles.detailTag, styles.customTag]}>
                      <MaterialIcons name="construction" size={16} color="#fff" />
                      <Text style={styles.detailTagText}>Custom Request</Text>
                    </View>
                  )}
                  {!selectedRequest.is_consultancy && !selectedRequest.is_custom_request && (
                    <View style={[styles.detailTag, styles.standardTag]}>
                      <MaterialIcons name="work" size={16} color="#fff" />
                      <Text style={styles.detailTagText}>Standard Service</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Images */}
              {selectedRequest.image_urls && selectedRequest.image_urls.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>
                    Attached Images ({selectedRequest.image_urls.length})
                  </Text>
                  <Text style={styles.imagesNote}>
                    Customer provided {selectedRequest.image_urls.length} image(s) for reference
                  </Text>
                </View>
              )}

              {/* Metadata */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Request Information</Text>
                <View style={styles.metadata}>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Request Date</Text>
                    <Text style={styles.metadataValue}>{formatDate(selectedRequest.created_at)}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Request ID</Text>
                    <Text style={[styles.metadataValue, styles.requestId]}>{selectedRequest.id}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <View style={styles.modalFooterRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleDeleteSingle(selectedRequest.id)}
                >
                  <MaterialIcons name="delete" size={18} color="#fff" style={styles.modalButtonIcon} />
                  <Text style={styles.modalButtonText}>Delete Request</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={18} color="#fff" style={styles.modalButtonIcon} />
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={styles.loadingText}>Loading hire requests...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (selectionMode ? clearSelection() : navigation.goBack())}>
          <MaterialIcons name="arrow-back" size={28} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Hire Requests</Text>
          <Text style={styles.headerSubtitle}>{requests.length} total requests</Text>
        </View>
        <View style={styles.headerRightSlot}>
          {selectionMode && (
            <TouchableOpacity
              onPress={handleDeleteSelected}
              disabled={!selectedCount}
              style={styles.headerDeleteButton}
            >
              <MaterialIcons
                name="delete"
                size={26}
                color={selectedCount ? '#e74c3c' : '#bdc3c7'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={80} color="#bdc3c7" />
          <Text style={styles.emptyTitle}>No hire requests yet</Text>
          <Text style={styles.emptySubtitle}>
            When customers submit service requests, they will appear here.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHireRequests}>
            <Text style={styles.retryButtonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2980b9']}
              tintColor={'#2980b9'}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelectable: {
    borderWidth: 1,
    borderColor: '#d6e4f0',
  },
  cardSelected: {
    borderColor: '#2980b9',
    backgroundColor: '#ecf5ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d6dc',
  },
  selectionBadgeSelected: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  selectionBadgeUnselected: {
    backgroundColor: '#fff',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  consultancyTag: {
    backgroundColor: '#9b59b6',
  },
  customTag: {
    backgroundColor: '#e67e22',
  },
  imagesTag: {
    backgroundColor: '#3498db',
  },
  standardTag: {
    backgroundColor: '#27ae60',
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  dateText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#95a5a6',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    padding: 20,
    maxHeight: '80%',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  completeButton: {
    backgroundColor: '#3498db',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  infoItemLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  infoItemValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  infoItemValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#eaf2fb',
  },
  userId: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
  },
  addressType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 18,
  },
  descriptionBox: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  detailTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imagesNote: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  metadata: {
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  metadataValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  requestId: {
    fontFamily: 'monospace',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  closeButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonIcon: {
    marginRight: 4,
  },
  headerRightSlot: {
    minWidth: 28,
    alignItems: 'flex-end',
  },
  headerDeleteButton: {
    padding: 4,
  },
});

export default AdminHireRequests;