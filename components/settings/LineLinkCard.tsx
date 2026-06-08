import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useLineLink } from './useLineLink';

export const LineLinkCard: React.FC = () => {
  const { isLinked, code, isLoading, errorMessage, generateCode, unlink } = useLineLink();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LINE 連携</Text>
      <Text style={styles.description}>
        LINE のトーク上で、アプリを開かずに「使った / 使ってない」を記録できます。
      </Text>

      {isLinked ? (
        <>
          <Text style={styles.linkedLabel}>連携済み</Text>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => void unlink()}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>連携を解除</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {code ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>このコードを公式アカウントに送ってください</Text>
              <Text style={styles.code}>{code}</Text>
              <Text style={styles.codeHint}>有効期限: 10 分</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.button}
            onPress={() => void generateCode()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{code ? 'コードを再発行' : '連携コードを発行'}</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingVertical: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  description: {
    fontSize: 13,
    color: '#999999',
  },
  linkedLabel: {
    fontSize: 14,
    color: '#DC052D',
    fontWeight: '600',
    marginTop: 4,
  },
  codeBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  codeLabel: {
    fontSize: 12,
    color: '#999999',
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 11,
    color: '#777777',
  },
  button: {
    backgroundColor: '#DC052D',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555555',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
  },
});
