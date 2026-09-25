/**
 * TagMultiSelect Component
 * Searchable skill and interest tag picker with chip toggles,
 * categorization tabs, and custom tag creation.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { Tag } from '../types';
import { api } from '../services/api';

interface TagMultiSelectProps {
  selectedTags: (string | Tag)[];
  onChange: (tags: Tag[]) => void;
  maxSelection?: number;
}

export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  selectedTags,
  onChange,
  maxSelection = 15
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'skill' | 'interest'>('all');
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    async function loadTags() {
      try {
        const res = await api.users.getTags();
        if (res.tags) {
          setAvailableTags(res.tags);
        }
      } catch (err) {
        console.warn('Failed to fetch tags:', err);
      }
    }
    loadTags();
  }, []);

  // Normalize selected IDs
  const selectedIds = new Set(
    selectedTags.map(t => (typeof t === 'string' ? t : t.id))
  );

  const isSelected = (tag: Tag) => selectedIds.has(tag.id) || selectedIds.has(tag.name);

  const toggleTag = (tag: Tag) => {
    let updated: Tag[];
    const normalizedSelected = selectedTags.map(t =>
      typeof t === 'string'
        ? availableTags.find(at => at.id === t || at.name === t) || { id: t, name: t, type: 'skill' as const }
        : t
    );

    if (isSelected(tag)) {
      updated = normalizedSelected.filter(t => t.id !== tag.id && t.name !== tag.name);
    } else {
      if (normalizedSelected.length >= maxSelection) return;
      updated = [...normalizedSelected, tag];
    }
    onChange(updated);
  };

  const handleAddNewTag = () => {
    if (!newTagName.trim()) return;
    const cleanName = newTagName.trim();
    const existing = availableTags.find(t => t.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      if (!isSelected(existing)) toggleTag(existing);
    } else {
      const newTag: Tag = {
        id: `custom-${Date.now()}`,
        name: cleanName,
        type: activeTab === 'interest' ? 'interest' : 'skill'
      };
      setAvailableTags(prev => [newTag, ...prev]);
      toggleTag(newTag);
    }
    setNewTagName('');
  };

  const filteredTags = availableTags.filter(tag => {
    const matchesTab = activeTab === 'all' || tag.type === activeTab;
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.tabBar}>
        {(['all', 'skill', 'interest'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All Tags' : tab === 'skill' ? '⚡ Skills' : '🌟 Interests'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search skills (React, Event Planning) or interests..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tag Cloud */}
      <ScrollView
        horizontal={false}
        contentContainerStyle={styles.tagCloud}
        style={styles.scrollArea}
        nestedScrollEnabled
      >
        {filteredTags.map(tag => {
          const active = isSelected(tag);
          const isSkill = tag.type === 'skill';
          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.chip,
                active && (isSkill ? styles.chipSkillActive : styles.chipInterestActive)
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={styles.chipEmoji}>{isSkill ? '⚡' : '🌟'}</Text>
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextActive
                ]}
              >
                {tag.name}
              </Text>
              {active && <Text style={styles.chipCheck}> ✓</Text>}
            </TouchableOpacity>
          );
        })}

        {filteredTags.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching tag found.</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleAddNewTag}>
              <Text style={styles.createButtonText}>+ Add "{searchQuery}" as tag</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Selected Tags Count */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          Selected: {selectedTags.length}/{maxSelection} tags
        </Text>
        <Text style={styles.footerHint}>Click any tag to toggle</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginVertical: 8
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: colors.primary
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#ffffff'
  },
  searchContainer: {
    marginBottom: 10
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  scrollArea: {
    maxHeight: 180
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingVertical: 4
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  chipSkillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: colors.primary
  },
  chipInterestActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderColor: colors.secondary
  },
  chipEmoji: {
    fontSize: 11,
    marginRight: 4
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '500'
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  chipCheck: {
    color: colors.success,
    fontSize: 11,
    fontWeight: 'bold'
  },
  emptyContainer: {
    padding: 12,
    alignItems: 'center',
    width: '100%'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginBottom: 6
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  createButtonText: {
    color: '#fff',
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  },
  footerHint: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs
  }
});
