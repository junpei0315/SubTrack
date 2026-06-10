import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
    <View className="gap-4">
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
        <ThemedText className="text-sm" lightColor="#c0392b" darkColor="#ff6b6b">
          {errorMessage}
        </ThemedText>
      ) : null}
      {successMessage ? (
        <ThemedText className="text-sm" lightColor="#1e8449" darkColor="#5fd07d">
          {successMessage}
        </ThemedText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleSubmit}
        className="items-center justify-center rounded-lg py-3.5"
        style={({ pressed }) => ({
          backgroundColor: tint,
          opacity: isSubmitting || pressed ? 0.7 : 1,
        })}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText className="text-base font-bold" lightColor="#fff" darkColor="#11181C">
            {submitLabel}
          </ThemedText>
        )}
      </Pressable>

      <View className="flex-row items-center gap-2">
        <View className="h-px flex-1 opacity-50" style={{ backgroundColor: icon }} />
        <ThemedText className="text-xs" lightColor={icon} darkColor={icon}>
          または
        </ThemedText>
        <View className="h-px flex-1 opacity-50" style={{ backgroundColor: icon }} />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleGoogle}
        className="items-center justify-center rounded-lg border py-3.5"
        style={({ pressed }) => ({
          borderColor: icon,
          opacity: isSubmitting || pressed ? 0.7 : 1,
        })}
      >
        <ThemedText className="text-base font-semibold">Google で続ける</ThemedText>
      </Pressable>

      {footer ? <View className="mt-2 items-center">{footer}</View> : null}
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
    <View className="gap-1.5">
      <ThemedText className="text-sm font-semibold">{label}</ThemedText>
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
        className="rounded-lg border px-3 py-3 text-base"
        style={{ color: textColor, borderColor }}
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
