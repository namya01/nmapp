/**
 * CommitteeDirectory Screen
 * Browsable directory of all college committees with department tags,
 * event counts, and quick search.
 */

import React, { useState, useEffect } from 'react';
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
import { Committee } from '../types';
import { api } from '../services/api';

interface CommitteeDirectoryProps {
  onSelectCommittee: (committeeId: string) => void;
}

export const CommitteeDirectory: React.FC<CommitteeDirectoryProps> = ({
  onSelectCommittee
}) => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadCommittees() {
      try {
        const res = await api.committees.getAll();
        if (res.committees) {
          setCommittees(res.committees);
        }
      } catch (err) {
        console.error('Failed to load committees:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCommittees();
  }, []);

  const filtered = committees.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Committees</Text>
        <Text style={styles.subtitle}>
          Official societies, technical chapters, and student governance bodies
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search committees (BBC, CulComm, Sports)..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Committee Cards */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.cardsList}>
          {filtered.map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              onPress={() => onSelectCommittee(c.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Text style={styles.committeeEmoji}>
                    {c.name.includes('Byte') || c.name.includes('BBC') ? '💻' :
                     c.name.includes('Cultural') ? '🎭' :
                     c.name.includes('Sports') ? '⚽' : '🚀'}
                  </Text>
                </View>
                <View style={styles.headerTitles}>
                  <Text style={styles.committeeName}>{c.name}</Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statPill}>
                      🏛️ {c.department_count || 0} Departments
                    </Text>
                    <Text style={[styles.statPill, styles.statPillEvents]}>
                      🎉 {c.event_count || 0} Events
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.description} numberOfLines={3}>
                {c.description}
              </Text>

              {/* Department Chips */}
              {c.departments && c.departments.length > 0 && (
                <View style={styles.deptChipsRow}>
                  {c.departments.map(d => (
                    <View key={d.id} style={styles.deptChip}>
                      <Text style={styles.deptChipText}>{d.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailText}>View Departments & Leads →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  header: {
    marginBottom: 16
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 4
  },
  searchBox: {
    marginBottom: 16
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.sizes.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardsList: {
    gap: 14
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  committeeEmoji: {
    fontSize: 22
  },
  headerTitles: {
    flex: 1
  },
  committeeName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  statPill: {
    color: colors.textSecondary,
    fontSize: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  statPillEvents: {
    color: colors.secondaryLight
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: 12
  },
  deptChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  deptChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  deptChipText: {
    color: colors.textMuted,
    fontSize: 10
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    alignItems: 'flex-end'
  },
  viewDetailText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: '700'
  }
});
