/**
 * OnboardingStep1 Screen
 * Collects student full name, official college email, and launches ID verification.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { IDUploadWidget } from '../components/IDUploadWidget';
import { OcrVerificationResult } from '../types';

interface OnboardingStep1Props {
  onNext: (step1Data: {
    fullName: string;
    collegeEmail: string;
    idCardUrl: string;
    ocrDetails: OcrVerificationResult;
  }) => void;
  onGoToLogin: () => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  onNext,
  onGoToLogin
}) => {
  const [fullName, setFullName] = useState('Rohan Sharma');
  const [collegeEmail, setCollegeEmail] = useState('rohan.sharma@college.edu');
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null);
  const [ocrDetails, setOcrDetails] = useState<OcrVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdVerified = (cardUrl: string, details: OcrVerificationResult) => {
    setIdCardUrl(cardUrl);
    setOcrDetails(details);
    setError(null);
  };

  const handleContinue = () => {
    if (!fullName.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!collegeEmail.trim()) {
      setError('Please enter your official college email.');
      return;
    }
    if (!ocrDetails || !ocrDetails.valid) {
      setError('Please scan and verify your physical College ID card before proceeding.');
      return;
    }

    onNext({
      fullName,
      collegeEmail,
      idCardUrl: idCardUrl || '',
      ocrDetails
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Header */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepBadgeActive}>
          <Text style={styles.stepBadgeText}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepBadgeInactive}>
          <Text style={styles.stepBadgeTextInactive}>2</Text>
        </View>
      </View>

      <Text style={styles.headerTitle}>Student Verification</Text>
      <Text style={styles.headerSubtitle}>
        Join your campus committee network. Verification requires an accredited college email and physical ID check.
      </Text>

      {/* Form Fields */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Full Legal Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rohan Sharma"
          placeholderTextColor={colors.textMuted}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Official College Email</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. yourname@college.edu"
          placeholderTextColor={colors.textMuted}
          value={collegeEmail}
          onChangeText={setCollegeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.helperText}>Must end with .edu, .ac.in, or university domain.</Text>
      </View>

      {/* Embedded ID Card Upload Widget */}
      <IDUploadWidget
        collegeEmail={collegeEmail}
        onVerified={handleIdVerified}
        onError={setError}
      />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Continue CTA */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          (!ocrDetails?.valid) && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>
          {ocrDetails?.valid ? '✓ ID Verified • Continue to Step 2' : 'Verify ID to Continue'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={onGoToLogin}>
        <Text style={styles.loginLinkText}>
          Already registered? <Text style={styles.loginLinkHighlight}>Sign In</Text>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
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
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 8
  },
  stepBadgeInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  stepBadgeTextInactive: {
    color: colors.textMuted,
    fontSize: 14
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
    marginBottom: 20
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
  helperText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  continueButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: typography.sizes.md,
    fontWeight: '700'
  },
  loginLink: {
    marginTop: 18,
    alignItems: 'center'
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm
  },
  loginLinkHighlight: {
    color: colors.primaryLight,
    fontWeight: '700'
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
  }
});
