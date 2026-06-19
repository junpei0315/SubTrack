import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { AppColors } from '@/constants/colors';
import { toAuthUserMessage } from '@/src/domain/auth';

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

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (error) {
      setErrorMessage(toAuthUserMessage(error));
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
      const message = toAuthUserMessage(error);
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
        editable={!isSubmitting}
      />
      <FormField
        label="パスワード"
        value={password}
        onChangeText={setPassword}
        placeholder="8 文字以上の英数字"
        secureTextEntry
        editable={!isSubmitting}
      />

      {errorMessage ? (
        <Text className="text-sm text-error-alt">{errorMessage}</Text>
      ) : null}
      {successMessage ? (
        <Text className="text-sm text-success">{successMessage}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleSubmit}
        className={`items-center justify-center rounded-full py-4 ${isSubmitting ? 'bg-white/[0.08]' : 'bg-accent'}`}
        style={({ pressed }) => ({ opacity: pressed && !isSubmitting ? 0.85 : 1 })}
      >
        {isSubmitting ? (
          <ActivityIndicator color={AppColors.text} />
        ) : (
          <Text className="text-base font-bold text-foreground">{submitLabel}</Text>
        )}
      </Pressable>

      <View className="flex-row items-center gap-2">
        <View className="h-px flex-1 bg-white/[0.08]" />
        <Text className="text-xs text-subtle">または</Text>
        <View className="h-px flex-1 bg-white/[0.08]" />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleGoogle}
        className="items-center justify-center rounded-full border border-white/10 bg-white/[0.08] py-4"
        style={({ pressed }) => ({ opacity: isSubmitting || pressed ? 0.7 : 1 })}
      >
        <Text className="text-base font-semibold text-foreground">Google で続ける</Text>
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
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  editable,
}: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
      <View className="min-h-12 flex-row items-center rounded-xl border border-white/10 bg-card px-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AppColors.whiteMuted40}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={AppColors.accent}
          underlineColorAndroid="transparent"
          {...(Platform.OS === 'android'
            ? { includeFontPadding: false, textAlignVertical: 'center' as const }
            : {})}
          className="flex-1 border-0 p-0 text-base leading-5 text-foreground outline-none"
          style={Platform.OS === 'android' ? { paddingVertical: 0 } : undefined}
        />
      </View>
    </View>
  );
}
