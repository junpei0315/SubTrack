import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent, Text, View } from 'react-native';

import { AppColors } from '@/constants/colors';

interface MarqueeTextProps {
  text: string;
  /** はみ出している場合に自動スクロールを開始する（選択中のプランのみ true 想定） */
  active: boolean;
  className?: string;
}

const MARQUEE_TEXT_STYLE = {
  color: AppColors.text,
  fontSize: 15,
  fontWeight: '600',
} as const;

/**
 * テキストがコンテナ幅をはみ出した場合に左右へ往復スクロールして全体を読めるようにする。
 */
export const MarqueeText: React.FC<MarqueeTextProps> = ({ text, active, className }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const runIdRef = useRef(0);

  const overflow = textWidth - containerWidth;
  const shouldScroll = active && overflow > 1 && containerWidth > 0;

  useEffect(() => {
    const runId = ++runIdRef.current;
    translateX.stopAnimation();
    translateX.setValue(0);

    if (!shouldScroll) {
      return;
    }

    const duration = Math.max(overflow * 35, 1500);

    const runCycle = () => {
      if (runIdRef.current !== runId) {
        return;
      }
      translateX.setValue(0);
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(translateX, {
          toValue: -overflow,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.delay(900),
      ]).start(({ finished }) => {
        if (finished && runIdRef.current === runId) {
          runCycle();
        }
      });
    };
    runCycle();

    return () => {
      runIdRef.current += 1;
      translateX.stopAnimation();
      translateX.setValue(0);
    };
  }, [shouldScroll, overflow, translateX]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleTextLayout = (event: LayoutChangeEvent) => {
    setTextWidth(event.nativeEvent.layout.width);
  };

  return (
    <View className={className} style={{ overflow: 'hidden' }} onLayout={handleContainerLayout}>
      <Animated.View
        style={{ alignSelf: 'flex-start', flexDirection: 'row', transform: [{ translateX }] }}
      >
        <Text numberOfLines={1} onLayout={handleTextLayout} style={MARQUEE_TEXT_STYLE}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};
