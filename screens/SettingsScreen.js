import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
// ✅ Fixed: Import SafeAreaView from correct package
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { APP_INFO, SUPPORT, LINKS } from './appconfig';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber || 
                     Constants.expoConfig?.android?.versionCode || '1';
const CURRENT_YEAR = new Date().getFullYear();

export default function SettingsScreen({ navigation }) {
  const [showDeveloperDetails, setShowDeveloperDetails] = useState(false);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleLinkPress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Unable to open link',
          'Please check your internet connection and try again.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Unable to open link',
        'Please check your internet connection and try again.'
      );
    }
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleLinkPress(`mailto:${SUPPORT.email}`);
  };

  const handleReportProblem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const subject = encodeURIComponent('Docuverify App Issue');
    const body = encodeURIComponent(
      'Please describe the issue you encountered:\n\n' +
      'Steps to reproduce:\n' +
      '1. \n' +
      '2. \n' +
      '3. \n\n' +
      `App Version: ${APP_VERSION}\n` +
      `Build: ${BUILD_NUMBER}`
    );
    handleLinkPress(`mailto:${SUPPORT.email}?subject=${subject}&body=${body}`);
  };

  const handleDeveloperPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDeveloperDetails(!showDeveloperDetails);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <View style={styles.aboutIconContainer}>
                <Ionicons name="shield" size={32} color="#667eea" />
              </View>
              <View>
                <Text style={styles.aboutTitle}>Docuverify</Text>
                <Text style={styles.aboutSubtitle}>
                  AI-powered Document Forgery Detection
                </Text>
              </View>
            </View>

            <View style={styles.aboutDivider} />

            <View style={styles.aboutInfoRow}>
              <Text style={styles.aboutInfoLabel}>AI Model</Text>
              <Text style={styles.aboutInfoValue}>DiT (ViT)</Text>
            </View>

            <View style={styles.aboutDivider} />

            <TouchableOpacity 
              style={styles.aboutLearnMore}
              onPress={() => handleLinkPress(SUPPORT.website)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Learn more about Docuverify"
            >
              <Text style={styles.aboutLearnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleContactSupport}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Contact support"
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={22} color="#667eea" />
              </View>
              <Text style={styles.menuText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleReportProblem}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Report a problem"
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="flag-outline" size={22} color="#667eea" />
              </View>
              <Text style={styles.menuText}>Report a Problem</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleLinkPress(LINKS.privacyPolicy)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Privacy policy"
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#667eea" />
              </View>
              <Text style={styles.menuText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleLinkPress(LINKS.termsOfService)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Terms of service"
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={22} color="#667eea" />
              </View>
              <Text style={styles.menuText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <TouchableOpacity 
            style={styles.developerRow}
            onPress={handleDeveloperPress}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Developer information"
          >
            <View style={styles.developerRowLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={22} color="#667eea" />
              </View>
              <Text style={styles.menuText}>Farhan Tariq</Text>
            </View>
            <Ionicons 
              name={showDeveloperDetails ? "chevron-up" : "chevron-forward"} 
              size={20} 
              color="#ccc" 
            />
          </TouchableOpacity>

          {showDeveloperDetails && (
            <View style={styles.developerDetails}>
              <Text style={styles.developerTitle}>Cyber Security Engineer</Text>
              <Text style={styles.developerInstitution}>MSc Cyber Security • Northumbria University</Text>
              
              <View style={styles.developerLinks}>
                <TouchableOpacity 
                  style={styles.developerLink}
                  onPress={() => handleLinkPress(`mailto:${SUPPORT.email}`)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Email developer"
                >
                  <Ionicons name="mail-outline" size={20} color="#667eea" />
                  <Text style={styles.developerLinkText}>Email</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.developerLink}
                  onPress={() => handleLinkPress(SUPPORT.linkedin)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="LinkedIn profile"
                >
                  <Ionicons name="logo-linkedin" size={20} color="#667eea" />
                  <Text style={styles.developerLinkText}>LinkedIn</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.developerLink}
                  onPress={() => handleLinkPress(SUPPORT.github)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="GitHub profile"
                >
                  <Ionicons name="logo-github" size={20} color="#667eea" />
                  <Text style={styles.developerLinkText}>GitHub</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.developerLink}
                  onPress={() => handleLinkPress(SUPPORT.website)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Developer website"
                >
                  <Ionicons name="globe-outline" size={20} color="#667eea" />
                  <Text style={styles.developerLinkText}>Website</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Application Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <View style={styles.versionCard}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Version</Text>
              <Text style={styles.versionValue}>{APP_VERSION}</Text>
            </View>
            <View style={styles.versionDivider} />
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Build Number</Text>
              <Text style={styles.versionValue}>{BUILD_NUMBER}</Text>
            </View>
            <View style={styles.versionDivider} />
            <TouchableOpacity 
              style={styles.versionRow}
              onPress={() => handleLinkPress(LINKS.licenses)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open source licenses"
            >
              <Text style={styles.versionLabel}>Open Source Licenses</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Docuverify</Text>
          <Text style={styles.footerVersion}>Version {APP_VERSION}</Text>
          <Text style={styles.footerCopyright}>© {CURRENT_YEAR} Farhan Tariq</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  aboutIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  aboutSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  aboutInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutInfoLabel: {
    fontSize: 14,
    color: '#888',
  },
  aboutInfoValue: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  aboutLearnMore: {
    alignSelf: 'flex-start',
  },
  aboutLearnMoreText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  developerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  developerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  developerDetails: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  developerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  developerInstitution: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  developerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  developerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.06)',
    borderRadius: 8,
  },
  developerLinkText: {
    fontSize: 13,
    color: '#667eea',
  },
  versionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  versionLabel: {
    fontSize: 14,
    color: '#888',
  },
  versionValue: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  versionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  footerVersion: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
});