/**
 * SessionExpiryModal Component
 * Implements Requirement 10: Displayed when the 45-day security session expires.
 * Informs the user and smoothly navigates them back to login.
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';

interface SessionExpiryModalProps {
  visible: boolean;
  onDismiss: () => void;
  onLoginAgain: () => void;
}

export const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({
  visible,
  onDismiss,
  onLoginAgain
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Security Shield Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.shieldEmoji}>🛡️</Text>
          </View>

          <Text style={styles.title}>Session Expired</Text>
          <Text style={styles.message}>
            Your 45-day security session has expired. To safeguard student committee data and confidential credentials, please sign in again.
          </Text>

          {/* Policy Info */}
          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Campus Security Policy #SEC-45</Text>
            <Text style={styles.policyText}>
              • Active refresh tokens strictly terminate after 45 days.
            </Text>
            <Text style={styles.policyText}>
              • Department editing rights must be re-verified periodically.
            </Text>
          </View>

          {/* Actions */}
          <TouchableOpacity style={styles.primaryButton} onPress={onLoginAgain}>
            <Text style={styles.primaryButtonText}>Sign In with College Credentials</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 29, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.warning,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning
  },
  shieldEmoji: {
    fontSize: 30
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    marginBottom: 8
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16
  },
  policyCard: {
    width: '100%',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  policyTitle: {
    color: colors.warning,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  policyText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: typography.sizes.sm,
    fontWeight: '700'
  }
});
