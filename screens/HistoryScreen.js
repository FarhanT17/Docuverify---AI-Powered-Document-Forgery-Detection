import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Document Type Mapping
const DOCUMENT_TYPES = {
  'advertisement': 'Passport/ID',
  'letter': 'Letter',
  'invoice': 'Invoice',
  'form': 'Form',
  'email': 'Email',
  'report': 'Report',
  'resume': 'Resume',
  'scientific': 'Scientific Paper',
  'news_article': 'News Article',
  'budget': 'Financial Document',
  'scientific_report': 'Scientific Report',
  'specification': 'Specification',
  'presentation': 'Presentation',
  'handwritten': 'Handwritten Document',
};

// ✅ Document Type Icons
const DOCUMENT_ICONS = {
  'Passport/ID': 'id-card-outline',
  'Letter': 'mail-outline',
  'Invoice': 'receipt-outline',
  'Email': 'mail-unread-outline',
  'Report': 'document-text-outline',
  'Resume': 'document-outline',
  'Scientific Paper': 'flask-outline',
  'News Article': 'newspaper-outline',
  'Financial Document': 'cash-outline',
  'Form': 'checkbox-outline',
  'Scientific Report': 'flask-outline',
  'Specification': 'settings-outline',
  'Presentation': 'presentation-outline',
  'Handwritten Document': 'create-outline',
};

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    applyFilters();
  }, [history, filter, searchQuery]);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('verificationHistory');
      if (data) {
        const parsedHistory = JSON.parse(data);
        setHistory(parsedHistory);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Apply status filter
    if (filter === 'Authentic') {
      filtered = filtered.filter(item => item.result === 'Authentic');
    } else if (filter === 'Forged') {
      filtered = filtered.filter(item => item.result === 'Forged');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        (item.documentType || 'Document').toLowerCase().includes(query)
      );
    }

    setFilteredHistory(filtered);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    if (diffMinutes < 43200) return `${Math.floor(diffMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (isForged) => {
    return isForged ? '#EF4444' : '#10B981';
  };

  const getStatusIcon = (isForged) => {
    return isForged ? 'warning' : 'checkmark-circle';
  };

  const getStatusLabel = (isForged) => {
    return isForged ? 'Forged' : 'Authentic';
  };

  // ✅ Get document type from raw prediction
  const getDocumentType = (item) => {
    if (item.documentType && item.documentType !== 'Document') {
      return item.documentType;
    }
    if (item.raw_prediction) {
      return DOCUMENT_TYPES[item.raw_prediction] || item.raw_prediction.charAt(0).toUpperCase() + item.raw_prediction.slice(1);
    }
    return 'Document';
  };

  // ✅ Get document icon
  const getDocumentIcon = (documentType) => {
    return DOCUMENT_ICONS[documentType] || 'document-text-outline';
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all verification records?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('verificationHistory', JSON.stringify([]));
              setHistory([]);
              setFilteredHistory([]);
            } catch (error) {
              console.error('Error clearing history:', error);
            }
          }
        }
      ]
    );
  };

  // Navigate to Result through CameraStack
  const navigateToResult = (item) => {
    const isForged = item.result === 'Forged';
    const documentType = getDocumentType(item);
    navigation.navigate('Verify', {
      screen: 'Result',
      params: {
        result: {
          prediction: item.result,
          confidence: item.confidence,
          is_forged: isForged,
          risk_level: isForged ? 'HIGH' : 'LOW',
          message: isForged 
            ? 'Document appears suspicious' 
            : 'Document verified successfully',
          document_type: documentType,
          raw_prediction: item.raw_prediction || 'Document'
        },
        imageUri: item.imageUri 
      }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
        {history.length === 0 && <View style={{ width: 40 }} />}
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadHistory} />
        }
      >
        {/* Search Bar */}
        {history.length > 0 && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search documents..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Filter Buttons */}
        {history.length > 0 && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'All' && styles.filterActive]}
              onPress={() => setFilter('All')}
            >
              <Text style={[styles.filterText, filter === 'All' && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'Authentic' && styles.filterActive]}
              onPress={() => setFilter('Authentic')}
            >
              <Text style={[styles.filterText, filter === 'Authentic' && styles.filterTextActive]}>
                Authentic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'Forged' && styles.filterActive]}
              onPress={() => setFilter('Forged')}
            >
              <Text style={[styles.filterText, filter === 'Forged' && styles.filterTextActive]}>
                Forged
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No Records Yet</Text>
            <Text style={styles.emptySubtext}>
              Verify a document and results will appear here
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Verify')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyButtonGradient}
              >
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Verify Document</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No Results Found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filter
            </Text>
          </View>
        ) : (
          filteredHistory.map((item, index) => {
            const isForged = item.result === 'Forged';
            const statusLabel = getStatusLabel(isForged);
            const statusColor = getStatusColor(isForged);
            const documentType = getDocumentType(item);
            const docIcon = getDocumentIcon(documentType);
            
            return (
              <TouchableOpacity
                key={item.id || index}
                style={styles.historyCard}
                onPress={() => navigateToResult(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons name="document-text-outline" size={28} color="#94A3B8" />
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    {/* ✅ Document Type with Icon */}
                    <View style={styles.docTypeRow}>
                      <Ionicons name={docIcon} size={14} color="#667eea" />
                      <Text style={styles.cardDocType}>{documentType}</Text>
                    </View>
                    <View style={styles.cardStatus}>
                      <Ionicons 
                        name={getStatusIcon(isForged)} 
                        size={14} 
                        color={statusColor} 
                      />
                      <Text style={[styles.cardStatusText, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                    <Text style={styles.cardConfidence}>
                      {item.confidence}% confidence
                    </Text>
                    <Text style={styles.cardTime}>{getTimeAgo(item.date)}</Text>
                  </View>
                  <View style={styles.cardArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 10,
    paddingVertical: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterActive: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  historyCard: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  // ✅ Document Type Row
  docTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cardDocType: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardConfidence: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  cardTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  cardArrow: {
    marginLeft: 8,
  },
});