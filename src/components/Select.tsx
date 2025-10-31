import {
  Adapt,
  Sheet,
  Select as TamaguiSelect,
  SelectProps as TamaguiSelectProps,
  SelectTriggerProps,
} from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface SelectProps {
  disabled: SelectTriggerProps['disabled'];
  items?: React.JSX.Element[];
  onValueChange: TamaguiSelectProps['onValueChange'];
  value: TamaguiSelectProps['value'];
}

export const Select = ({
  disabled,
  items,
  onValueChange,
  value,
}: SelectProps) => {
  return (
    <TamaguiSelect defaultValue="" value={value} onValueChange={onValueChange}>
      <TamaguiSelect.Trigger
        disabled={disabled}
        iconAfter={<MaterialIcons name="arrow-drop-down" size={24} />}
      >
        <TamaguiSelect.Value placeholder="Select Faction" />
      </TamaguiSelect.Trigger>

      <Adapt when="maxMd" platform="touch">
        <Sheet modal dismissOnSnapToBottom animation="medium">
          <Sheet.Frame>
            <Sheet.ScrollView alwaysBounceVertical={false}>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <TamaguiSelect.Content>
        <TamaguiSelect.Viewport minWidth={200}>
          <TamaguiSelect.Group>{items}</TamaguiSelect.Group>
        </TamaguiSelect.Viewport>
      </TamaguiSelect.Content>
    </TamaguiSelect>
  );
};
