import type React from "react"
import { ScrollView, View, Text, StyleSheet, RefreshControl } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors, spacing } from "@/theme/colors"

export function Screen({
  title,
  subtitle,
  children,
  refreshing,
  onRefresh,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  refreshing?: boolean
  onRefresh?: () => void
}) {
  const insets = useSafeAreaInsets()
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl },
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  body: {
    gap: spacing.lg,
  },
})
