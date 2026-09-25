/**
 * OnboardingStep2 Screen
 * Creates student credentials (username & password) with verified ID credentials.
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
import { OcrVerificationResult } from '../types';
import { useAuth } from '../context/AuthContext';

interface OnboardingStep2Props {
  step1Data: {
    fullName: string;
    collegeEmail: string;
    idCardUrl: string;
    ocrDetails: OcrVerificationResult;
  };
  onSuccess: () => void;
  onBack: () => void;
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  step1Data,
  onSuccess,
  onBack
}) => {
  const { register } = useAuth();
  const [username, setUsername] = useState(
    step1Data.fullName.toLowerCase().replace(/\s+/g, '_') + '_2026'
  );
  const [password, setPassword] = useState('Password123!');
  const [confirmPassword, setConfirmPassword] = useState('Password123!');
  const [role, setRole] = useState<'student' | 'committee_member'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please choose a username.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await register({
        full_name: step1Data.fullName,
        college_email: step1Data.collegeEmail,
        username: username.trim(),
        password,
        id_card_url: step1Data.idCardUrl,
        id_verified: true,
        role
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Header */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepBadgeDone}>
          <Text style={styles.stepBadgeText}>✓</Text>
        </View>
        <View style={styles.stepLineActive} />
        <View style={styles.stepBadgeActive}>
          <Text style={styles.stepBadgeText}>2</Text>
        </View>
      </View>

      <Text style={styles.headerTitle}>Create Account Credentials</Text>
      <Text style={styles.headerSubtitle}>
        Set up your login credentials. Your college ID has been verified with institution credentials.
      </Text>

      {/* Verified Badge Card */}
      <View style={styles.verifiedCard}>
        <View style={styles.verifiedIconBox}>
          <Text style={styles.verifiedCheck}>✓</Text>
        </View>
        <View style={styles.verifiedInfo}>
          <Text style={styles.verifiedName}>{step1Data.fullName}</Text>
          <Text style={styles.verifiedEmail}>{step1Data.collegeEmail}</Text>
          <Text style={styles.verifiedRoll}>
            Roll No: {step1Data.ocrDetails?.detectedRollNo || '2024CS08421'} • Verified Student
          </Text>
        </View>
      </View>

      {/* Username Input */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Campus Username</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. rohan_sharma"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Role Selection */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Account Role</Text>
        <View style={styles.rolePickerRow}>
          <TouchableOpacity
            style={[styles.roleOption, role === 'student' && styles.roleOptionActive]}
            onPress={() => setRole('student')}
          >
            <Text style={styles.roleTitle}>🎓 Student Member</Text>
            <Text style={styles.roleDesc}>Browse committees, attend events, upload CV for applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleOption, role === 'committee_member' && styles.roleOptionActive]}
            onPress={() => setRole('committee_member')}
          >
            <Text style={styles.roleTitle}>⚡ Committee Rep</Text>
            <Text style={styles.roleDesc}>Represent department, manage recaps with authorized email</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Inputs */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat password"
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Complete Registration & Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to Step 1</Text>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  stepBadgeDone: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepBadgeActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  stepLineActive: {
    width: 60,
    height: 2,
    backgroundColor: colors.primary,
    marginHorizontal: 8
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    marginBottom: 6
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: 16
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
    marginBottom: 20
  },
  verifiedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  verifiedCheck: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '900'
  },
  verifiedInfo: {
    flex: 1
  },
  verifiedName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700'
  },
  verifiedEmail: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs
  },
  verifiedRoll: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  fieldGroup: {
    marginBottom: 16
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
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
  rolePickerRow: {
    gap: 8
  },
  roleOption: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.15)'
  },
  roleTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    marginBottom: 2
  },
  roleDesc: {
    color: colors.textMuted,
    fontSize: 11
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: typography.sizes.md,
    fontWeight: '700'
  },
  backButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 6
  },
  backButtonText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm
  }
});
