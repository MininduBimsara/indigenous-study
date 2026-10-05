import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ScrollView, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  GUIDELINES, SECTION_COLORS, SUBTHEME_ICONS,
  type Guideline, type GuidelineSection, type SubTheme,
} from '../data/guidelines';
import { triggerHaptic } from '../utils/haptic';
import { palette } from '../theme/colors';

// G13: search with autocomplete + forgiving matching
// G85: consistent, predictable screen structure
// G41: show only relevant content (filter/search reduces noise)

const ALL_SECTIONS: GuidelineSection[] = [
  'A: W3C COGA Design Patterns',
  'B: WCAG 2.2 Cognitive Success Criteria',
  'C: Dementia-Specific',
  'D: Autism Spectrum Disorder',
  'E: Mild Cognitive Impairment',
  'F: ADHD',
  'G: Acute Stress & Disaster-Context',
];

const SECTION_SHORT: Record<GuidelineSection, string> = {
  'A: W3C COGA Design Patterns': 'COGA',
  'B: WCAG 2.2 Cognitive Success Criteria': 'WCAG',
  'C: Dementia-Specific': 'Dementia',
  'D: Autism Spectrum Disorder': 'ASD',
  'E: Mild Cognitive Impairment': 'MCI',
  'F: ADHD': 'ADHD',
  'G: Acute Stress & Disaster-Context': 'Disaster',
};

function GuidelineCard({ item }: { item: Guideline }) {
  const [expanded, setExpanded] = useState(false);
  const sectionColor = SECTION_COLORS[item.section];
  const subIcon = SUBTHEME_ICONS[item.subTheme];

  return (
    <Pressable
      onPress={() => { setExpanded(e => !e); triggerHaptic('tap'); }}
      accessibilityRole="button"
      accessibilityLabel={`${item.id}: ${item.name}. Tap to ${expanded ? 'collapse' : 'expand'}.`}
      accessibilityHint={expanded ? 'Currently expanded' : 'Tap to see full description and application example'}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Colour bar */}
      <View style={[styles.colorBar, { backgroundColor: sectionColor }]} />

      {/* Card header */}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={[styles.idBadge, { backgroundColor: sectionColor }]}>
            <Text style={styles.idBadgeText}>{item.id}</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle} numberOfLines={expanded ? undefined : 2}>
              {item.name}
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={palette.slate[500]}
          />
        </View>

        {/* Sub-theme chip */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{subIcon} {item.subTheme}</Text>
          </View>
          {!item.openAccess && (
            <View style={[styles.chip, styles.chipPaywall]}>
              <Text style={[styles.chipText, styles.chipTextPaywall]}>Paywalled</Text>
            </View>
          )}
        </View>

        {/* Description – always visible */}
        <Text style={styles.cardDesc}>{item.description}</Text>

        {/* Expanded: EWS application example */}
        {expanded && (
          <View style={styles.expandedSection}>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>DEWS Application</Text>
              <Text style={styles.exampleText}>{item.ewsApplication}</Text>
            </View>
            <View style={styles.citationRow}>
              <Ionicons name="library-outline" size={14} color={palette.slate[400]} />
              <Text style={styles.citationText}>{item.citation}</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function GuidelinesScreen() {
  const [query, setQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<GuidelineSection | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<SubTheme | null>(null);

  // G13: forgiving search across id, name, description, application text
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUIDELINES.filter(g => {
      const sectionOk = !selectedSection || g.section === selectedSection;
      const themeOk = !selectedTheme || g.subTheme === selectedTheme;
      if (!q) return sectionOk && themeOk;
      const haystack = [g.id, g.name, g.description, g.ewsApplication, g.subTheme]
        .join(' ').toLowerCase();
      return haystack.includes(q) && sectionOk && themeOk;
    });
  }, [query, selectedSection, selectedTheme]);

  const allThemes = useMemo(() => {
    const set = new Set(GUIDELINES.map(g => g.subTheme));
    return Array.from(set).sort();
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setSelectedSection(null);
    setSelectedTheme(null);
    triggerHaptic('tap');
  }, []);

  const hasFilters = !!query || !!selectedSection || !!selectedTheme;

  const renderItem = useCallback(({ item }: { item: Guideline }) => (
    <GuidelineCard item={item} />
  ), []);

  const keyExtractor = useCallback((item: Guideline) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header — G1: purpose of this screen is clear */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { router.back(); triggerHaptic('tap'); }}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={palette.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Design Guidelines</Text>
          <Text style={styles.headerSubtitle}>
            {filtered.length} of 128 guidelines
          </Text>
        </View>
      </View>

      {/* G13: Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={palette.slate[500]} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search guidelines..."
            placeholderTextColor={palette.slate[400]}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            accessibilityLabel="Search guidelines"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={20} color={palette.slate[400]} />
            </TouchableOpacity>
          )}
        </View>
        {hasFilters && (
          <TouchableOpacity
            onPress={clearFilters}
            style={styles.clearBtn}
            accessibilityLabel="Clear all filters"
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Section filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
        accessibilityLabel="Filter by section"
      >
        {ALL_SECTIONS.map(section => {
          const isActive = selectedSection === section;
          const color = SECTION_COLORS[section];
          return (
            <TouchableOpacity
              key={section}
              onPress={() => {
                setSelectedSection(isActive ? null : section);
                triggerHaptic('tap');
              }}
              style={[
                styles.pill,
                { borderColor: color },
                isActive && { backgroundColor: color },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={`Filter by ${SECTION_SHORT[section]}`}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {SECTION_SHORT[section]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sub-theme filter row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.pillsRow, { paddingTop: 0, paddingBottom: 8 }]}
        accessibilityLabel="Filter by sub-theme"
      >
        {allThemes.map(theme => {
          const isActive = selectedTheme === theme;
          return (
            <TouchableOpacity
              key={theme}
              onPress={() => {
                setSelectedTheme(isActive ? null : theme as SubTheme);
                triggerHaptic('tap');
              }}
              style={[
                styles.pill,
                styles.pillTheme,
                isActive && styles.pillThemeActive,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={`Filter by ${theme}`}
            >
              <Text style={[styles.pillText, styles.pillTextTheme, isActive && styles.pillTextActive]}>
                {SUBTHEME_ICONS[theme as SubTheme]} {theme}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results count / empty state */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No guidelines match</Text>
          <Text style={styles.emptyDesc}>Try different search terms or clear the filters.</Text>
          <TouchableOpacity onPress={clearFilters} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={10}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Showing {filtered.length} of 128 guidelines
              </Text>
              <Text style={styles.footerSub}>
                Sources: W3C COGA, WCAG 2.2, peer-reviewed research (2012–2025)
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.slate[50],
  },
  header: {
    backgroundColor: palette.slate[900],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: palette.slate[400],
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate[200],
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.slate[100],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.slate[200],
    paddingHorizontal: 12,
    minHeight: 44,
    gap: 8,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: palette.slate[900],
    paddingVertical: 0,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: palette.red[100],
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: palette.red[600],
    fontSize: 13,
    fontWeight: '800',
  },
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: palette.white,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: palette.slate[300],
    backgroundColor: palette.slate[50],
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTheme: {
    borderColor: palette.slate[200],
    backgroundColor: palette.slate[50],
  },
  pillThemeActive: {
    backgroundColor: palette.slate[900],
    borderColor: palette.slate[900],
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.slate[600],
  },
  pillTextTheme: {
    color: palette.slate[500],
  },
  pillTextActive: {
    color: palette.white,
  },
  list: {
    padding: 12,
    gap: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.slate[200],
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardPressed: {
    opacity: 0.92,
  },
  colorBar: {
    width: 6,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  idBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
    flexShrink: 0,
  },
  idBadgeText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.slate[900],
    lineHeight: 21,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: palette.slate[100],
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipPaywall: {
    backgroundColor: palette.yellow[100],
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.slate[600],
  },
  chipTextPaywall: {
    color: palette.yellow[800],
  },
  cardDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.slate[600],
    lineHeight: 19,
  },
  expandedSection: {
    gap: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    paddingTop: 10,
  },
  exampleBox: {
    backgroundColor: palette.slate[50],
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: palette.blue[500],
    padding: 12,
    gap: 4,
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.blue[500],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  exampleText: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.slate[700],
    lineHeight: 19,
    fontStyle: 'italic',
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  citationText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.slate[400],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 56,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: palette.slate[900],
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.slate[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyBtn: {
    backgroundColor: palette.slate[900],
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyBtnText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.slate[500],
  },
  footerSub: {
    fontSize: 11,
    fontWeight: '500',
    color: palette.slate[400],
    textAlign: 'center',
  },
});
