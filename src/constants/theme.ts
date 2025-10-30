import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui, createTokens } from 'tamagui';

const tokens = createTokens({
  color: {
    // neutrals
    voidBg: '#000020',
    voidBg2: '#000025',
    surface1: '#0F1048',
    surface2: '#0B0B3D',
    border: '#151659',
    borderHover: '#1B1D6B',
    text: '#F2F4FF',
    textMuted: '#C6CBF7',

    // roles from splash screen art
    brandSolid: '#5A187B', // purple gas
    onBrand: '#F6ECFF',

    accentSolid: '#1C9DA7', // cyan (mid) from #9BE8D7/#D0F2FB family
    onAccent: '#031416',

    infoSolid: '#24258A', // deep nebula blue
    onInfo: '#EAF0FF',
  },
});

export const voidConfig = createTamagui({
  ...defaultConfig,
  tokens,

  themes: {
    // single neutral dark app theme
    dark: {
      background: tokens.color.voidBg,
      backgroundHover: tokens.color.surface2,
      backgroundPress: tokens.color.surface1,
      borderColor: tokens.color.border,
      borderColorHover: tokens.color.borderHover,
      color: tokens.color.text,
      placeholderColor: tokens.color.borderHover,

      // role tokens (use directly on components)
      brandSolid: tokens.color.brandSolid,
      onBrand: tokens.color.onBrand,
      accentSolid: tokens.color.accentSolid,
      onAccent: tokens.color.onAccent,
      infoSolid: tokens.color.infoSolid,
      onInfo: tokens.color.onInfo,
    },
  },
});

type VoidConfig = typeof voidConfig;

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'tamagui' {
  interface TamaguiCustomConfig extends VoidConfig {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
