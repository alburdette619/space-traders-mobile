import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

import { voidRunnerIcons } from '../constants/icons';

const BACK_BUTTON_SIZE = 32;

export const BackButton = () => {
  const { goBack } = useNavigation();
  return (
    <IconButton
      icon={voidRunnerIcons.backButton}
      onPress={goBack}
      size={BACK_BUTTON_SIZE}
      style={styles.backButton}
    />
  );
};

const styles = StyleSheet.create({
  backButton: {
    height: BACK_BUTTON_SIZE,
    width: BACK_BUTTON_SIZE,
  },
});
