import { useLocales } from 'expo-localization';
import { camelCase, countBy } from 'lodash';
import { useCallback, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyAgent } from '../api/models/agents/agents';
import { useGetContracts } from '../api/models/contracts/contracts';
import { useGetMyShips } from '../api/models/fleet/fleet';
import { voidRunnerIcons } from '../constants/icons';
import { getFactionImageUrl } from '../constants/urls';
import { flexStyles, gapStyles, roundStyleObject } from '../theme/globalStyles';

export const FleetScreen = () => {
  const { colors } = useTheme();
  const [locale] = useLocales();
  console.log(colors.shadow);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale.languageTag, {
        currency: locale.currencyCode || 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
        style: 'currency',
      }),
    [locale],
  );

  const { data: agent, isFetching: isFetchingAgent } = useGetMyAgent();
  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();
  const { data: contracts, isFetching: isFetchingContracts } =
    useGetContracts();

  const isLoading = isFetchingAgent || isFetchingShips || isFetchingContracts;

  const shipStatusCounts = useMemo(() => {
    const statusCounts = countBy(ships?.data || [], (ship) =>
      camelCase(ship.nav.status),
    );

    const dockedCount = statusCounts['docked'] || 0;
    const inOrbitCount = statusCounts['inOrbit'] || 0;
    const inTransitCount = statusCounts['inTransit'] || 0;

    return {
      docked: dockedCount,
      inOrbit: inOrbitCount,
      inTransit: inTransitCount,
    };
  }, [ships]);

  const renderHeader = useCallback(() => {
    const formattedCredits = currencyFormatter
      .format(agent?.data.credits || 0)
      .replace(locale.currencySymbol || '$', '')
      .trim();

    return (
      <Surface
        elevation={5}
        mode="elevated"
        style={[
          { backgroundColor: colors.secondaryContainer },
          styles.headerContainer,
        ]}
      >
        <View style={[flexStyles.flexRow, gapStyles.gapMedium]}>
          {!!agent?.data.startingFaction && (
            <Image
              source={{
                uri: getFactionImageUrl(agent?.data.startingFaction),
              }}
              style={{ ...roundStyleObject(60) }}
            />
          )}
          <View style={[flexStyles.flex, styles.headerInfoContainer]}>
            <Text style={styles.agentSymbolText} variant="titleLarge">
              {agent?.data.symbol}
            </Text>
            <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
              <Icon size={16} source={voidRunnerIcons.credits} />
              <Text variant="bodySmall">{formattedCredits}</Text>
            </View>
            <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
              <Icon size={16} source={voidRunnerIcons.contracts} />
              <Text variant="bodySmall">{contracts?.data.length}</Text>
            </View>
            <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
              <Icon size={16} source={'space-station'} />
              <Text variant="bodySmall">{`${shipStatusCounts.docked} | `}</Text>
              <Icon size={16} source={'orbit'} />
              <Text variant="bodySmall">{`${shipStatusCounts.inOrbit} | `}</Text>
              <Icon size={16} source={voidRunnerIcons.fleet} />
              <Text variant="bodySmall">{`${shipStatusCounts.inTransit}`}</Text>
            </View>
          </View>
        </View>
      </Surface>
    );
  }, [
    agent?.data.credits,
    agent?.data.startingFaction,
    agent?.data.symbol,
    contracts?.data.length,
    locale.currencySymbol,
    colors.secondaryContainer,
    currencyFormatter,
    shipStatusCounts,
  ]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[flexStyles.flex, { backgroundColor: colors.secondaryContainer }]}
    >
      <FlatList
        data={ships?.data}
        ListHeaderComponent={renderHeader}
        renderItem={() => null}
        stickyHeaderIndices={[0]}
        style={{
          backgroundColor: colors.background,
          flexGrow: 1,
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  agentSymbolText: {
    marginBottom: 8,
  },
  headerContainer: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  headerInfoContainer: {},
});
