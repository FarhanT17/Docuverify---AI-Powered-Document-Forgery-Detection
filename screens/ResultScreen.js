import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

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

export default function ResultScreen({ route, navigation }) {
  const { result, imageUri } = route.params;

  // ✅ Get document type from raw prediction
  const getDocumentType = (rawPrediction) => {
    if (!rawPrediction) return 'Document';
    return DOCUMENT_TYPES[rawPrediction] || rawPrediction.charAt(0).toUpperCase() + rawPrediction.slice(1);
  };

  // ✅ Get document icon
  const getDocumentIcon = (documentType) => {
    return DOCUMENT_ICONS[documentType] || 'document-text-outline';
  };

  const documentType = getDocumentType(result.raw_prediction);
  const documentIcon = getDocumentIcon(documentType);

  // Save to history when result is received
  useEffect(() => {
    if (result) {
      saveToHistory(result, imageUri);
    }
  }, []);

  const saveToHistory = async (resultData, imageUri) => {
    try {
      const existing = await AsyncStorage.getItem('verificationHistory');
      const history = existing ? JSON.parse(existing) : [];
      
      const newEntry = {
        id: Date.now(),
        documentType: documentType,
        result: resultData.prediction,
        confidence: resultData.confidence,
        date: new Date().toISOString(),
        imageUri: imageUri,
        raw_prediction: resultData.raw_prediction,
      };
      
      history.unshift(newEntry);
      await AsyncStorage.setItem('verificationHistory', JSON.stringify(history));
      console.log('✅ Saved to history:', newEntry);
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const shareResult = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: `🛡️ Docuverify Verification Report\n\n📄 Document: ${documentType}\n📊 Result: ${result.prediction}\n🎯 Confidence: ${result.confidence}%\n⚠️ Risk Level: ${result.risk_level}\n\n${result.message}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleDashboardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.getParent()?.navigate('Home');
  };

  const handleVerifyNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.getParent()?.navigate('Verify');
  };

  // Get result configuration based on prediction
  const getResultConfig = () => {
    const prediction = result.prediction;
    
    if (prediction === 'Inconclusive') {
      return {
        icon: 'alert-circle',
        iconColor: '#F59E0B',
        statusColor: '#F59E0B',
        title: 'Inconclusive',
        subtitle: 'Manual Verification Required'
      };
    } else if (result.is_forged) {
      return {
        icon: 'warning',
        iconColor: '#EF4444',
        statusColor: '#EF4444',
        title: 'Forged',
        subtitle: 'Document appears suspicious'
      };
    } else {
      return {
        icon: 'checkmark-circle',
        iconColor: '#10B981',
        statusColor: '#10B981',
        title: 'Authentic',
        subtitle: 'Document verified successfully'
      };
    }
  };

  const config = getResultConfig();

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.resultImage} />
          </View>
        )}

        <View style={styles.resultCard}>
          {/* ✅ Document Type Badge */}
          <View style={styles.docTypeBadge}>
            <Ionicons name={documentIcon} size={16} color="#667eea" />
            <Text style={styles.docTypeText}>{documentType}</Text>
          </View>

          <View style={styles.resultIconContainer}>
            <Ionicons 
              name={config.icon} 
              size={48} 
              color={config.iconColor} 
            />
          </View>
          
          <Text style={[
            styles.resultStatus,
            { color: config.statusColor }
          ]}>
            {config.title}
          </Text>
          
          <Text style={styles.resultSubtitle}>
            {config.subtitle}
          </Text>

          <View style={styles.divider} />

          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { 
                width: `${result.confidence}%`,
                backgroundColor: result.prediction === 'Inconclusive' ? '#F59E0B' : '#3B82F6'
              }]} />
            </View>
            <Text style={styles.confidenceText}>
              {result.confidence}% Confidence
            </Text>
          </View>

          <View style={styles.riskBadge}>
            <LinearGradient
              colors={
                result.risk_level === 'HIGH' 
                  ? ['#EF4444', '#DC2626'] 
                  : result.risk_level === 'MEDIUM'
                  ? ['#F59E0B', '#D97706']
                  : ['#3B82F6', '#2563EB']
              }
              style={styles.riskGradient}
            >
              <Ionicons 
                name={result.risk_level === 'HIGH' ? 'warning' : 'shield-checkmark'} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.riskText}>Risk Level: {result.risk_level}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.messageText}>
            {result.message}
          </Text>

          {/* Show manual review note for inconclusive results */}
          {result.prediction === 'Inconclusive' && (
            <View style={styles.manualReviewContainer}>
              <Ionicons name="hand-left-outline" size={18} color="#F59E0B" />
              <Text style={styles.manualReviewText}>
                Manual verification recommended
              </Text>
            </View>
          )}
        </View>

        {/* Enterprise Buttons */}
        <View style={styles.actionButtons}>
          {/* Share Report Button - Primary (Solid Blue) */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={shareResult}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Share report"
          >
            <LinearGradient
              colors={['#2563EB', '#2563EB']}
              style={styles.actionGradient}
            >
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.actionText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Verify New Button - Success (Solid Emerald) */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleVerifyNew}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Verify new document"
          >
            <LinearGradient
              colors={['#059669', '#059669']}
              style={styles.actionGradient}
            >
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={styles.actionText}>Verify New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Dashboard Button - Secondary (White with Gray Border) */}
        <TouchableOpacity 
          style={styles.dashboardButton}
          onPress={handleDashboardPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go to dashboard"
        >
          <View style={styles.dashboardOutline}>
            <Ionicons name="home-outline" size={18} color="#334155" />
            <Text style={styles.dashboardText}>Return to Dashboard</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  resultImage: {
    width: 160,
    height: 200,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#f5f5f5',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  // ✅ Document Type Badge
  docTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  docTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#667eea',
  },
  resultIconContainer: {
    marginBottom: 6,
  },
  resultStatus: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 14,
  },
  confidenceContainer: {
    width: '100%',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  riskBadge: {
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  riskGradient: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    gap: 6,
  },
  riskText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 14,
    color: '#555',
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  inconclusiveMessage: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  manualReviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  manualReviewText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dashboardButton: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  dashboardOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 8,
  },
  dashboardText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});