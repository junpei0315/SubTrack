import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';

import { useLineLink } from './useLineLink';

export const LineLinkCard: React.FC = () => {
  const { isLinked, code, isLoading, errorMessage, generateCode, unlink } = useLineLink();

  return (
    <View className="gap-2 self-stretch py-4">
      <Text className="text-base font-bold text-foreground">LINE 連携</Text>
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
          {code ? (
            <View className="mt-2 items-center gap-1 rounded-xl bg-card-alt p-4">
              <Text className="text-xs text-muted">このコードを公式アカウントに送ってください</Text>
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
