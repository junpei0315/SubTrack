import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface AuthFormProps {
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  /** 送信完了時に表示する成功メッセージ（任意）。 */
  successMessage?: string | null;
  /** 画面下部のリンク（サインイン⇄サインアップの切り替えなど）。 */
  footer?: ReactNode;
}

export function AuthForm({
  submitLabel,
  onSubmit,
  onGoogleSignIn,
  successMessage,
  footer,
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onGoogleSignIn();
    } catch (error) {
      const message = toMessage(error);
      // キャンセルはエラー表示しない。
      if (message) {
        setErrorMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <FormField
        label="メールアドレス"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        textColor={text}
        borderColor={icon}
        placeholderColor={icon}
        editable={!isSubmitting}
      />
      <FormField
        label="パスワード"
        value={password}
        onChangeText={setPassword}
        placeholder="8 文字以上の英数字"
        secureTextEntry
        textColor={text}
        borderColor={icon}
        placeholderColor={icon}
        editable={!isSubmitting}
      />

      {errorMessage ? (
        <ThemedText style={styles.error} lightColor="#c0392b" darkColor="#ff6b6b">
          {errorMessage}
        </ThemedText>
      ) : null}
      {successMessage ? (
        <ThemedText style={styles.success} lightColor="#1e8449" darkColor="#5fd07d">
          {successMessage}
        </ThemedText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: tint, opacity: isSubmitting || pressed ? 0.7 : 1 },
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.primaryLabel} lightColor="#fff" darkColor="#11181C">
            {submitLabel}
          </ThemedText>
        )}
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: icon }]} />
        <ThemedText style={styles.dividerText} lightColor={icon} darkColor={icon}>
          または
        </ThemedText>
        <View style={[styles.divider, { backgroundColor: icon }]} />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleGoogle}
        style={({ pressed }) => [
          styles.googleButton,
          { borderColor: icon, opacity: isSubmitting || pressed ? 0.7 : 1 },
        ]}
      >
        <ThemedText style={styles.googleLabel}>Google で続ける</ThemedText>
      </Pressable>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  editable?: boolean;
  textColor: string;
  borderColor: string;
  placeholderColor: string;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  editable,
  textColor,
  borderColor,
  placeholderColor,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: textColor, borderColor }]}
      />
    </View>
  );
}

function toMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AuthCancelledError') {
      return '';
    }
    return error.message;
  }
  return '予期しないエラーが発生しました';
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 14,
  },
  success: {
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
  dividerText: {
    fontSize: 12,
  },
  googleButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
});
