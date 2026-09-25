/**
 * LoginScreen
 * Allows users to sign in with college credentials and provides instant demo profile switchers.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onGoToRegister }) => {
  const { login, quickSwitchUser } = useAuth();
  const [username, setUsername] = useState('rohan_student');
  const [password, setPassword] = useState('Password123!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please provide username and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSwitch = async (role: 'student' | 'committee_lead' | 'admin') => {
    setIsSubmitting(true);
    setError(null);
    try {
      await quickSwitchUser(role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🏛️</Text>
        </View>
        <Text style={styles.appTitle}>Student Committee Platform</Text>
        <Text style={styles.appTagline}>
          Campus verified directory, RBAC governance & event recap intelligence
        </Text>
      </View>

      {/* Login Card */}
      <View style={styles.loginCard}>
        <Text style={styles.cardHeading}>Sign In</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username or College Email</Text>
          <TextInput
            style={styles.input}
            placeholder="rohan_student or rohan@college.edu"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In to Campus Portal</Text>
          )}
        </TouchableOpacity>

        {/* 45-day Session Guarantee Notice */}
        <View style={styles.sessionNotice}>
          <Text style={styles.sessionNoticeText}>
            🔒 Protected by 45-Day Refresh Token TTL & Institutional RBAC
          </Text>
        </View>
      </View>

      {/* Demo Fast Switcher */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>⚡ Quick Demo Personas (One-Click Sign In):</Text>
        <View style={styles.demoButtonsRow}>
          <TouchableOpacity
            style={styles.demoCard}
            onPress={() => handleQuickSwitch('student')}
          >
            <Text style={styles.demoEmoji}>👨‍🎓</Text>
            <Text style={styles.demoName}>Rohan Sharma</Text>
            <Text style={styles.demoRole}>Verified Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoCard, styles.demoCardLead]}
            onPress={() => handleQuickSwitch('committee_lead')}
          >
            <Text style={styles.demoEmoji}>⚡</Text>
            <Text style={styles.demoName}>Jane Doe</Text>
            <Text style={styles.demoRole}>BBC Events Lead (RBAC)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoCard}
            onPress={() => handleQuickSwitch('admin')}
          >
            <Text style={styles.demoEmoji}>🛡️</Text>
            <Text style={styles.demoName}>Campus Admin</Text>
            <Text style={styles.demoRole}>Global Governance</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* New Student Onboarding CTA */}
      <TouchableOpacity style={styles.registerLink} onPress={onGoToRegister}>
        <Text style={styles.registerLinkText}>
          New student? <Text style={styles.registerLinkHighlight}>Verify ID & Register</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: 24
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary
  },
  logoIcon: {
    fontSize: 32
  },
  appTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center'
  },
  appTagline: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18
  },
  loginCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 20
  },
  cardHeading: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    marginBottom: 16
  },
  fieldGroup: {
    marginBottom: 14
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: typography.sizes.sm
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  loginButtonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: typography.sizes.sm,
    fontWeight: '700'
  },
  sessionNotice: {
    marginTop: 14,
    alignItems: 'center'
  },
  sessionNoticeText: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center'
  },
  demoSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20
  },
  demoTitle: {
    color: colors.secondaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8
  },
  demoCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  demoCardLead: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)'
  },
  demoEmoji: {
    fontSize: 20,
    marginBottom: 4
  },
  demoName: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'
  },
  demoRole: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 10
  },
  registerLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm
  },
  registerLinkHighlight: {
    color: colors.primaryLight,
    fontWeight: '700'
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  }
});
