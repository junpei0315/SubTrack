import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { AppColors } from '@/constants/colors';

import type { BubblePlacement, HighlightRect, ProductTourStep } from './productTourSteps';

const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.72)';

interface ProductTourOverlayProps {
  step: ProductTourStep;
  stepIndex: number;
  totalSteps: number;
  highlight: HighlightRect | null;
  onNext: () => void;
  onSkip: () => void;
}

function SpotlightMask({ hole }: { hole: HighlightRect }) {
  const { x, y, width, height } = hole;

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: y,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: y,
          left: 0,
          width: x,
          height,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: y,
          left: x + width,
          right: 0,
          height,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: y + height,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width,
          height,
          borderRadius: hole.borderRadius ?? 12,
          borderWidth: 2,
          borderColor: AppColors.accentBrand,
        }}
      />
    </>
  );
}

function FullScreenDim() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: OVERLAY_COLOR,
      }}
    />
  );
}

function TourBubble({
  title,
  body,
  placement,
  highlight,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
  isCtaStep,
  screenWidth,
  screenHeight,
}: {
  title: string;
  body: string;
  placement: BubblePlacement;
  highlight: HighlightRect | null;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  isCtaStep: boolean;
  screenWidth: number;
  screenHeight: number;
}) {
  const bubbleWidth = Math.min(screenWidth - 32, 340);
  const isLast = stepIndex === totalSteps - 1;

  if (isCtaStep || !highlight) {
    const top = Math.max(80, screenHeight * 0.28);
    return (
      <View
        style={{
          position: 'absolute',
          left: (screenWidth - bubbleWidth) / 2,
          top,
          width: bubbleWidth,
        }}
        className="gap-3 rounded-2xl bg-card p-5"
      >
        <Text className="text-center text-lg font-bold text-foreground">{title}</Text>
        <Text className="text-center text-sm leading-5 text-muted">{body}</Text>
        <View className="mt-1 items-center gap-3">
          <Text className="text-xs text-subtle">
            {stepIndex + 1} / {totalSteps}
          </Text>
          <Pressable
            onPress={onNext}
            className="w-full items-center rounded-full bg-accent py-3.5"
            accessibilityRole="button"
          >
            <Text className="text-base font-bold text-foreground">
              {isLast ? '登録をはじめる' : '次へ'}
            </Text>
          </Pressable>
          {!isLast ? (
            <Pressable onPress={onSkip} hitSlop={8} accessibilityRole="button">
              <Text className="text-sm font-semibold text-subtle">スキップ</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  const bubbleLeft = Math.max(
    16,
    Math.min(highlight.x + highlight.width / 2 - bubbleWidth / 2, screenWidth - bubbleWidth - 16)
  );
  const bubbleTop =
    placement === 'below'
      ? Math.min(highlight.y + highlight.height + 20, screenHeight - 220)
      : Math.max(16, highlight.y - 200);

  const arrowLeft = Math.min(
    Math.max(highlight.x + highlight.width / 2 - 8, bubbleLeft + 16),
    bubbleLeft + bubbleWidth - 24
  );
  const arrowTop = placement === 'below' ? bubbleTop - 10 : bubbleTop + 168;

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: arrowLeft,
          top: arrowTop,
          width: 0,
          height: 0,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderBottomWidth: placement === 'below' ? 10 : 0,
          borderTopWidth: placement === 'above' ? 10 : 0,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: placement === 'below' ? AppColors.card : 'transparent',
          borderTopColor: placement === 'above' ? AppColors.card : 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: bubbleLeft,
          top: bubbleTop,
          width: bubbleWidth,
        }}
        className="gap-3 rounded-2xl bg-card p-4"
      >
        <Text className="text-base font-bold text-foreground">{title}</Text>
        <Text className="text-sm leading-5 text-muted">{body}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-subtle">
            {stepIndex + 1} / {totalSteps}
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable onPress={onSkip} hitSlop={8} accessibilityRole="button">
              <Text className="text-sm font-semibold text-subtle">スキップ</Text>
            </Pressable>
            <Pressable
              onPress={onNext}
              className="rounded-full bg-accent px-4 py-2"
              accessibilityRole="button"
            >
              <Text className="text-sm font-bold text-foreground">{isLast ? '完了' : '次へ'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

export function ProductTourOverlay({
  step,
  stepIndex,
  totalSteps,
  highlight,
  onNext,
  onSkip,
}: ProductTourOverlayProps) {
  const { width, height } = useWindowDimensions();
  const isCtaStep = !step.anchorId;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
    >
      {highlight && !isCtaStep ? <SpotlightMask hole={highlight} /> : <FullScreenDim />}
      <TourBubble
        title={step.title}
        body={step.body}
        placement={step.bubblePlacement}
        highlight={highlight}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        onNext={onNext}
        onSkip={onSkip}
        isCtaStep={isCtaStep}
        screenWidth={width}
        screenHeight={height}
      />
    </View>
  );
}
