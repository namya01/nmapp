/**
 * Root Mobile Application Component
 * Connects AuthProvider, bottom tab navigation, screen routers, and 45-day SessionExpiryModal.
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet
} from 'react-native';
import { colors, typography } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { OnboardingStep1 } from './src/screens/OnboardingStep1';
import { OnboardingVerifying } from './src/screens/OnboardingVerifying';
import { OnboardingStep2 } from './src/screens/OnboardingStep2';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CommitteeDirectory } from './src/screens/CommitteeDirectory';
import { CommitteeDetail } from './src/screens/CommitteeDetail';
import { EventRecapFeed } from './src/screens/EventRecapFeed';
import { EventRecapDetail } from './src/screens/EventRecapDetail';
import { EventRecapEditor } from './src/screens/EventRecapEditor';
import { SessionExpiryModal } from './src/components/SessionExpiryModal';
import { OcrVerificationResult } from './src/types';

function MainApp() {
  const { user, sessionExpired, dismissSessionExpiry, logout } = useAuth();

  // Navigation states
  const [authView, setAuthView] = useState<'login' | 'step1' | 'verifying' | 'step2'>('login');
  const [activeTab, setActiveTab] = useState<'committees' | 'events' | 'profile'>('committees');

  // Sub-navigation routes
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editorCommitteeId, setEditorCommitteeId] = useState<string | null>(null);

  // Onboarding cache
  const [step1Data, setStep1Data] = useState<{
    fullName: string;
    collegeEmail: string;
    idCardUrl: string;
    ocrDetails: OcrVerificationResult;
  } | null>(null);

  // If user is not authenticated, render Onboarding / Login flows
  if (!user) {
    if (authView === 'step1') {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <OnboardingStep1
            onNext={(data) => {
              setStep1Data(data);
              setAuthView('verifying');
            }}
            onGoToLogin={() => setAuthView('login')}
          />
        </SafeAreaView>
      );
    }

    if (authView === 'verifying') {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <OnboardingVerifying onComplete={() => setAuthView('step2')} />
        </SafeAreaView>
      );
    }

    if (authView === 'step2' && step1Data) {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <OnboardingStep2
            step1Data={step1Data}
            onSuccess={() => {}}
            onBack={() => setAuthView('step1')}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <LoginScreen onGoToRegister={() => setAuthView('step1')} />
        {/* Session Expiry Modal */}
        <SessionExpiryModal
          visible={sessionExpired}
          onDismiss={dismissSessionExpiry}
          onLoginAgain={dismissSessionExpiry}
        />
      </SafeAreaView>
    );
  }

  // Render Authenticated App
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Screen Render Switch */}
      <View style={styles.screenWrapper}>
        {editorCommitteeId ? (
          <EventRecapEditor
            committeeId={editorCommitteeId}
            onSuccess={(newEventId) => {
              setEditorCommitteeId(null);
              setSelectedEventId(newEventId);
            }}
            onCancel={() => setEditorCommitteeId(null)}
          />
        ) : selectedEventId ? (
          <EventRecapDetail
            eventId={selectedEventId}
            onBack={() => setSelectedEventId(null)}
          />
        ) : selectedCommitteeId ? (
          <CommitteeDetail
            committeeId={selectedCommitteeId}
            onBack={() => setSelectedCommitteeId(null)}
            onSelectEvent={(eventId) => setSelectedEventId(eventId)}
            onOpenEventEditor={(commId) => setEditorCommitteeId(commId)}
          />
        ) : activeTab === 'committees' ? (
          <CommitteeDirectory
            onSelectCommittee={(id) => setSelectedCommitteeId(id)}
          />
        ) : activeTab === 'events' ? (
          <EventRecapFeed
            onSelectEvent={(id) => setSelectedEventId(id)}
            onSelectCommittee={(id) => {
              setSelectedCommitteeId(id);
              setActiveTab('committees');
            }}
          />
        ) : (
          <ProfileScreen />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedCommitteeId(null);
            setSelectedEventId(null);
            setEditorCommitteeId(null);
            setActiveTab('committees');
          }}
        >
          <Text style={styles.tabIcon}>🏛️</Text>
          <Text style={[styles.tabLabel, activeTab === 'committees' && styles.tabLabelActive]}>
            Committees
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedCommitteeId(null);
            setSelectedEventId(null);
            setEditorCommitteeId(null);
            setActiveTab('events');
          }}
        >
          <Text style={styles.tabIcon}>🎉</Text>
          <Text style={[styles.tabLabel, activeTab === 'events' && styles.tabLabelActive]}>
            Event Recaps
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedCommitteeId(null);
            setSelectedEventId(null);
            setEditorCommitteeId(null);
            setActiveTab('profile');
          }}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            My Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* 45-day Session Expiry Modal */}
      <SessionExpiryModal
        visible={sessionExpired}
        onDismiss={dismissSessionExpiry}
        onLoginAgain={() => {
          dismissSessionExpiry();
          logout();
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background
  },
  screenWrapper: {
    flex: 1
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around'
  },
  tabItem: {
    alignItems: 'center'
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  tabLabelActive: {
    color: colors.primaryLight,
    fontWeight: '700'
  }
});
