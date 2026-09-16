import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';

import { type Ship } from '@/src/api/models/models-Ship/ship';
import { shipActionIcons } from '@/src/constants/icons';
import { useGetShipActions } from '@/src/hooks/useGetShipActions';
import { useShipActionController } from '@/src/hooks/useShipActionController';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';

import { RefuelDialog } from './RefuelDialog';

export const ShipActions = ({ ship }: { ship: Ship }) => {
  const { colors } = useTheme();
  const { actions, isError, isPending } = useGetShipActions(ship);
  const {
    confirmRefuel,
    dismissFeedback,
    dismissRequestedAction,
    feedbackMessage,
    isFeedbackError,
    pendingActionType,
    requestedActionType,
    startAction,
  } = useShipActionController(ship);
  const [selectedUnavailableReason, setSelectedUnavailableReason] =
    useState<string>();

  const primaryActionType = actions.find(({ isEnabled }) => isEnabled)?.type;
  const requestedActionLabel = actions.find(
    ({ type }) => type === requestedActionType,
  )?.label;
  const requestedActionMessage = requestedActionLabel
    ? requestedActionType !== 'refuel'
      ? `${requestedActionLabel} needs an additional setup flow.`
      : undefined
    : undefined;
  const snackbarMessage =
    selectedUnavailableReason ?? feedbackMessage ?? requestedActionMessage;
  const actionRows = Array.from(
    { length: Math.ceil(actions.length / 2) },
    (_, rowIndex) => actions.slice(rowIndex * 2, rowIndex * 2 + 2),
  );

  const dismissSnackbar = () => {
    setSelectedUnavailableReason(undefined);
    dismissFeedback();
    dismissRequestedAction();
  };

  return (
    <View style={gapStyles.gapMedium}>
      <View style={[flexStyles.flexRow, styles.sectionHeader]}>
        <Text variant="titleLarge">Actions</Text>
        {isPending && <ActivityIndicator size="small" />}
      </View>

      {isError && (
        <Text style={{ color: colors.error }} variant="bodySmall">
          Some contextual actions could not be loaded.
        </Text>
      )}

      {actions.length > 0 ? (
        <View style={styles.actionGrid}>
          {actionRows.map((actionRow) => (
            <View
              key={actionRow.map(({ type }) => type).join('-')}
              style={styles.actionRow}
            >
              {actionRow.map((action) => {
                const isDisabled = !action.isEnabled || !!pendingActionType;

                return (
                  <Pressable
                    accessibilityHint={action.unavailableReason}
                    accessibilityLabel={
                      action.unavailableReason
                        ? `${action.label}. Unavailable: ${action.unavailableReason}`
                        : action.label
                    }
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isDisabled }}
                    key={action.type}
                    onPress={() => {
                      if (action.unavailableReason) {
                        setSelectedUnavailableReason(
                          (currentReason) =>
                            currentReason ?? action.unavailableReason,
                        );
                        return;
                      }

                      startAction(action.type);
                    }}
                    style={styles.actionContainer}
                  >
                    <Button
                      disabled={isDisabled}
                      icon={shipActionIcons[action.type]}
                      loading={pendingActionType === action.type}
                      mode={
                        action.type === primaryActionType
                          ? 'contained'
                          : 'outlined'
                      }
                      pointerEvents="none"
                    >
                      {action.label}
                    </Button>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      ) : (
        !isPending && (
          <Text style={{ color: colors.onSurfaceVariant }} variant="bodyMedium">
            No actions are available while this ship is in transit.
          </Text>
        )
      )}

      <Portal>
        <Snackbar
          duration={3000}
          onDismiss={dismissSnackbar}
          style={
            !selectedUnavailableReason && feedbackMessage && isFeedbackError
              ? { backgroundColor: colors.error }
              : undefined
          }
          visible={!!snackbarMessage}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>

      <RefuelDialog
        isPending={pendingActionType === 'refuel'}
        onConfirm={confirmRefuel}
        onDismiss={dismissRequestedAction}
        ship={ship}
        visible={requestedActionType === 'refuel'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flex: 1,
  },
  actionGrid: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionHeader: {
    justifyContent: 'space-between',
  },
});
