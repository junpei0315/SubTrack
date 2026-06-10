import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// 共通モーダル用ルート。確認ダイアログ等の汎用モーダルが必要になったら src/shared/ui から呼ぶ想定。
export default function ModalScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
      <ThemedText type="title">Modal</ThemedText>
      <ThemedText>共通モーダル（未実装）</ThemedText>
    </ThemedView>
  );
}
