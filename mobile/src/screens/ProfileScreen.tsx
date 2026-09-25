/**
 * ProfileScreen
 * Displays expanded student profile, verified status badge, avatar modification,
 * skill/interest tags picker, CV storage with timestamp, and committee memberships.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { TagMultiSelect } from '../components/TagMultiSelect';
import { CVUploader } from '../components/CVUploader';
import { api } from '../services/api';
import { Tag } from '../types';

export const ProfileScreen: React.FC = () => {
  const { user, refreshProfile, logout } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [tags, setTags] = useState<Tag[]>(user?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await api.users.updateMe({
        full_name: fullName,
        tags: tags.map(t => t.name)
      });
      await refreshProfile();
      setIsEditingName(false);
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async () => {
    // Generate fresh avatar seed
    const newAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`;
    try {
      await api.users.uploadAvatar({ avatar_url: newAvatar });
      await refreshProfile();
    } catch (e) {
      console.warn('Avatar update failed:', e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={handleAvatarChange} style={styles.avatarWrapper}>
            <Image
              source={{ uri: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }}
              style={styles.avatar}
            />
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            {isEditingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={fullName}
                  onChangeText={setFullName}
                  autoFocus
                />
                <TouchableOpacity style={styles.saveSmallBtn} onPress={handleSaveProfile}>
                  <Text style={styles.saveSmallText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameDisplayRow}>
                <Text style={styles.userName}>{user.full_name}</Text>
                <TouchableOpacity onPress={() => setIsEditingName(true)}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.userUsername}>@{user.username}</Text>
            <Text style={styles.userEmail}>{user.college_email}</Text>

            <View style={styles.statusBadgesRow}>
              {user.id_verified && (
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedPillText}>✓ ID Verified</Text>
                </View>
              )}
              <View style={[styles.rolePill, user.role === 'committee_member' && styles.rolePillLeader]}>
                <Text style={styles.rolePillText}>
                  {user.role === 'committee_member' ? '⚡ Committee Rep' : user.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Committee Memberships & Authorized Emails */}
      {user.committee_memberships && user.committee_memberships.length > 0 && (
        <View style={styles.committeeCard}>
          <Text style={styles.sectionTitle}>🏛️ Committee Assignments & Authorized RBAC</Text>
          <Text style={styles.sectionSubtitle}>
            These verified institutional emails grant exclusive editing permissions for event recaps.
          </Text>

          <View style={styles.membershipList}>
            {user.committee_memberships.map((m, idx) => (
              <View key={idx} style={styles.membershipItem}>
                <View style={styles.membershipIconBox}>
                  <Text style={styles.membershipIcon}>⚡</Text>
                </View>
                <View style={styles.membershipDetails}>
                  <Text style={styles.membershipDept}>
                    {m.department_name || 'Department'} • {m.committee_name || 'Committee'}
                  </Text>
                  <Text style={styles.membershipEmail}>
                    Authorized Email: <Text style={styles.emailHighlight}>{m.committee_email}</Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills & Interests Picker */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>⚡ Skills & Campus Interests</Text>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity style={styles.saveTagsBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveTagsText}>Save Tags</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionSubtitle}>
          Select your technical proficiencies and extracurricular passions.
        </Text>

        <TagMultiSelect
          selectedTags={tags}
          onChange={newTags => setTags(newTags)}
        />
      </View>

      {/* CV Storage Section */}
      <CVUploader
        currentCvUrl={user.cv_url}
        uploadedAt={user.cv_uploaded_at}
        onCvUploaded={(url, at) => refreshProfile()}
      />

      {saveMessage && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {saveMessage}</Text>
        </View>
      )}

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>🚪 Sign Out of Campus Session</Text>
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
    padding: 16,
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 14
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: colors.primary
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.surface,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  avatarBadgeText: {
    fontSize: 12
  },
  userInfo: {
    flex: 1
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  userName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '700'
  },
  editIcon: {
    fontSize: 14
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  nameInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    fontSize: typography.sizes.sm
  },
  saveSmallBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  saveSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  userUsername: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  statusBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  verifiedPill: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  verifiedPillText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700'
  },
  rolePill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  rolePillLeader: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)'
  },
  rolePillText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700'
  },
  committeeCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 14
  },
  sectionBox: {
    marginBottom: 14
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '700'
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginBottom: 8
  },
  saveTagsBtn: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary
  },
  saveTagsText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700'
  },
  membershipList: {
    marginTop: 10,
    gap: 8
  },
  membershipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  membershipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  membershipIcon: {
    fontSize: 14
  },
  membershipDetails: {
    flex: 1
  },
  membershipDept: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: '700'
  },
  membershipEmail: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  emailHighlight: {
    color: colors.secondaryLight,
    fontWeight: '600'
  },
  successBanner: {
    backgroundColor: colors.successBg,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10
  },
  successText: {
    color: colors.success,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    textAlign: 'center'
  },
  logoutButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: '700'
  }
});
