import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2563EB',
  success: '#059669',
  error: '#DC2626',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

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

export default function HomeScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    authentic: 0,
    forged: 0,
    accuracy: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const appStats = {
    accuracy: '94.5%',
    images: '29K',
    model: 'DiT (ViT)',
  };

  const recentHistory = history.slice(0, 3);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      return () => {};
    }, [])
  );

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      let data = await AsyncStorage.getItem('verificationHistory');
      
      if (!data) {
        data = await AsyncStorage.getItem('scanHistory');
      }
      
      if (data) {
        const parsedHistory = JSON.parse(data);
        setHistory(parsedHistory);
        updateStats(parsedHistory);
      } else {
        setHistory([]);
        setStats({
          total: 0,
          authentic: 0,
          forged: 0,
          accuracy: 0,
        });
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = useCallback((historyData) => {
    const total = historyData.length;
    const authentic = historyData.filter(item => item.result === 'Authentic').length;
    const forged = historyData.filter(item => item.result === 'Forged').length;
    const accuracy = total > 0 ? Math.round((authentic / total) * 100) : 0;

    setStats({
      total,
      authentic,
      forged,
      accuracy,
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  // ✅ Get document type from raw prediction
  const getDocumentType = (rawPrediction) => {
    if (!rawPrediction) return 'Document';
    return DOCUMENT_TYPES[rawPrediction] || rawPrediction.charAt(0).toUpperCase() + rawPrediction.slice(1);
  };

  // ✅ Get document icon based on type
  const getDocumentIcon = (documentType) => {
    const type = documentType.toLowerCase();
    if (type.includes('passport') || type.includes('id')) return 'id-card-outline';
    if (type.includes('letter')) return 'mail-outline';
    if (type.includes('invoice')) return 'receipt-outline';
    if (type.includes('email')) return 'mail-unread-outline';
    if (type.includes('report')) return 'document-text-outline';
    if (type.includes('resume')) return 'document-outline';
    if (type.includes('scientific')) return 'flask-outline';
    if (type.includes('news')) return 'newspaper-outline';
    if (type.includes('financial') || type.includes('budget')) return 'cash-outline';
    if (type.includes('form')) return 'checkbox-outline';
    return 'document-text-outline';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="shield" size={36} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Docuverify</Text>
          <Text style={styles.headerSubtitle}>AI Document Forgery Detector</Text>

          <View style={styles.performanceCard}>
            <View style={styles.performanceStats}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceNumber}>{appStats.accuracy}</Text>
                <Text style={styles.performanceLabel}>Accuracy</Text>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceItem}>
                <Text style={styles.performanceNumber}>{appStats.images}</Text>
                <Text style={styles.performanceLabel}>Images</Text>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceItem}>
                <Text style={styles.performanceNumber}>{appStats.model}</Text>
                <Text style={styles.performanceLabel}>Model</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Verify Document Button */}
      <View style={styles.verifySection}>
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => navigation.navigate('Verify')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifyGradient}
          >
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
            <Text style={styles.verifyButtonText}>Verify Document</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Verification Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Verification Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#667eea' }]}>
              <Ionicons name="document-text-outline" size={22} color="#fff" />
            </View>
            <Text style={styles.summaryNumber}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Checked</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            </View>
            <Text style={styles.summaryNumber}>{stats.authentic}</Text>
            <Text style={styles.summaryLabel}>Authentic</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="warning-outline" size={22} color="#fff" />
            </View>
            <Text style={styles.summaryNumber}>{stats.forged}</Text>
            <Text style={styles.summaryLabel}>Forged</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#764ba2' }]}>
              <Ionicons name="stats-chart-outline" size={22} color="#fff" />
            </View>
            <Text style={styles.summaryNumber}>{stats.accuracy}%</Text>
            <Text style={styles.summaryLabel}>Detection</Text>
          </View>
        </View>
      </View>

      {/* Recent Verifications */}
      <View style={styles.latestSection}>
        <View style={styles.latestHeader}>
          <Text style={styles.sectionTitle}>Recent Verifications</Text>
          {history.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="scan-outline" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>No Verifications Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start by verifying your first document
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Verify')}
            >
              <View style={styles.emptyStateButtonInner}>
                <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                <Text style={styles.emptyStateButtonText}>Get Started</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.historyList}>
            {recentHistory.map((item, index) => {
              const isAuthentic = item.result === 'Authentic';
              // ✅ Get document type and icon
              const documentType = getDocumentType(item.raw_prediction);
              const docIcon = getDocumentIcon(documentType);
              
              return (
                <TouchableOpacity
                  key={item.id || index}
                  style={[
                    styles.historyItem,
                    index === recentHistory.length - 1 && styles.historyItemLast
                  ]}
                  onPress={() => navigation.navigate('Reports')}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyItemLeft}>
                    {item.imageUri ? (
                      <Image 
                        source={{ uri: item.imageUri }} 
                        style={styles.historyThumbnail}
                      />
                    ) : (
                      <View style={[styles.historyDot, { backgroundColor: isAuthentic ? COLORS.success : COLORS.error }]} />
                    )}
                    <View>
                      <View style={styles.historyItemHeader}>
                        <Ionicons name={docIcon} size={14} color={COLORS.textSecondary} />
                        <Text style={styles.historyItemType}>
                          {documentType}
                        </Text>
                      </View>
                      <Text style={styles.historyItemTime}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={[styles.historyItemResult, { color: isAuthentic ? COLORS.success : COLORS.error }]}>
                      {item.result}
                    </Text>
                    <Text style={styles.historyItemConfidence}>
                      {item.confidence}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerGradient: {
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  performanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    width: width - 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  performanceLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  performanceDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  verifySection: {
    paddingHorizontal: 20,
    marginTop: -14,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  verifyGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryCard: {
    width: (width - 50) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  latestSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyStateButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyStateButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyItemType: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  historyItemTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemResult: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyItemConfidence: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  footerSpacer: {
    height: 24,
  },
});