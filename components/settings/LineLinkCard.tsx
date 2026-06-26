import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';

import { useLineLink } from './useLineLink';

const LINK_STEPS = [
  '1. 公式アカウントを友だち追加',
  '2. 連携コードを発行',
  '3. トークにコードを送信',
] as const;

export const LineLinkCard: React.FC = () => {
  const {
    isLinked,
    code,
    isLoading,
    errorMessage,
    generateCode,
    openOfficialAccount,
    unlink,
  } = useLineLink();

  return (
    <View className="gap-2 self-stretch">
      <Text className="text-[13px] text-muted">
        LINE のトーク上で、アプリを開かずに「使った / 使ってない」を記録できます。
      </Text>

      {isLinked ? (
        <>
          <Text className="mt-1 text-sm font-semibold text-accent-brand">連携済み</Text>
          <TouchableOpacity
            className="mt-2 items-center rounded-full border border-border-muted bg-transparent py-3"
            onPress={() => void unlink()}
            disabled={isLoading}
          >
            <Text className="text-sm font-semibold text-foreground">連携を解除</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View className="mt-2 gap-1">
            <Text className="text-xs text-muted">連携手順</Text>
            {LINK_STEPS.map((step) => (
              <Text key={step} className="text-[13px] text-foreground">
                {step}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            className="mt-2 items-center rounded-full bg-line-brand py-3"
            onPress={() => void openOfficialAccount()}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="LINE公式アカウントを追加"
          >
            <Text className="text-sm font-semibold text-foreground">LINE公式アカウントを追加</Text>
          </TouchableOpacity>

          {code ? (
            <View className="mt-2 items-center gap-1 rounded-xl bg-card-alt p-4">
              <Text className="text-xs text-muted">このコードを公式アカウントのトークに送ってください</Text>
              <Text className="text-[32px] font-bold tracking-[4px] text-foreground">{code}</Text>
              <Text className="text-[11px] text-muted-dark">有効期限: 10 分</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="mt-2 items-center rounded-full bg-accent-brand py-3"
            onPress={() => void generateCode()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={AppColors.text} />
            ) : (
              <Text className="text-sm font-semibold text-foreground">
                {code ? 'コードを再発行' : '連携コードを発行'}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {errorMessage ? <Text className="text-[13px] text-error-alt">{errorMessage}</Text> : null}
    </View>
  );
};
