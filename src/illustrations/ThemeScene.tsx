import React from 'react';
import { Image, View } from 'react-native';
import { C } from '../theme';

/**
 * Theme artwork used as card headers, onboarding tiles and the finish modal.
 *
 * The scenes are illustrations generated with Higgsfield (Recraft V4.1,
 * "standard" mode) from one shared storybook style prompt, then stored as
 * webp (~85KB each, ~670KB for the set). Regenerate with the prompts recorded
 * in scenes.md if the set ever needs to change — keep the style tail identical
 * so the eight stay consistent.
 */
export interface SceneProps {
  theme: string;
  height?: number;
}

const SCENES: Record<string, ReturnType<typeof require>> = {
  벚꽃길: require('../../assets/scenes/cherry.webp'),
  '한강 야경': require('../../assets/scenes/night.webp'),
  '골목 투어': require('../../assets/scenes/alley.webp'),
  '도심 물길': require('../../assets/scenes/stream.webp'),
  숲길: require('../../assets/scenes/forest.webp'),
  성곽길: require('../../assets/scenes/fortress.webp'),
  '철길 공원': require('../../assets/scenes/railpark.webp'),
  롱워크: require('../../assets/scenes/riverwalk.webp'),
};

export default function ThemeScene({ theme, height = 96 }: SceneProps) {
  const source = SCENES[theme];
  if (!source) {
    return <View style={{ height, backgroundColor: C.paperDeep }} />;
  }
  return (
    <Image
      source={source}
      style={{ width: '100%', height }}
      resizeMode="cover"
      accessibilityLabel={`${theme} 일러스트`}
    />
  );
}
