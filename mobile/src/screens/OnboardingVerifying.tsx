/**
 * OnboardingVerifying Screen
 * Visual loading state while OCR engine parses student identity credentials.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';

interface OnboardingVerifyingProps {
  onComplete: () => void;
}

export const OnboardingVerifying: React.FC<OnboardingVerifyingProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);

  const verificationStages = [
    'Initializing Optical Character Recognition (OCR)...',
    'Analyzing document structure and security watermarks...',
    'Matching institution keywords (STUDENT, COLLEGE, ROLL NO)...',
    'Validating 6+ digit Student Enrollment Pattern...',
    'Verifying college email domain authenticity...',
    'All checks passed! Loading account creation...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev < verificationStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.radarCard}>
        {/* Animated Radar Pulse Circle */}
        <View style={styles.pulseOuter}>
          <View style={styles.pulseMiddle}>
            <View style={styles.pulseInner}>
              <ActivityIndicator size="large" color={colors.secondaryLight} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Verifying Student Identity</Text>
        <Text style={styles.subtitle}>
          Executing OCR verification & campus directory validation pipeline
        </Text>

        {/* Verification Pipeline Checklist */}
        <View style={styles.pipelineBox}>
          {verificationStages.map((stage, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;
            return (
              <View key={idx} style={styles.stageRow}>
                <View
                  style={[
                    styles.stageDot,
                    isCompleted && styles.stageDotComplete,
                    isCurrent && styles.stageDotActive
                  ]}
                >
                  {isCompleted ? (
                    <Text style={styles.checkMark}>✓</Text>
                  ) : (
                    <Text style={styles.stageNumber}>{idx + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stageText,
                    isCompleted && styles.stageTextComplete,
                    isCurrent && styles.stageTextActive
                  ]}
                >
                  {stage}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  radarCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    alignItems: 'center'
  },
  pulseOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  pulseMiddle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pulseInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginBottom: 24
  },
  pipelineBox: {
    width: '100%',
    gap: 12
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stageDotActive: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(6, 182, 212, 0.2)'
  },
  stageDotComplete: {
    borderColor: colors.success,
    backgroundColor: colors.success
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  stageNumber: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600'
  },
  stageText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    flex: 1
  },
  stageTextActive: {
    color: colors.secondaryLight,
    fontWeight: '600'
  },
  stageTextComplete: {
    color: colors.textPrimary
  }
});
