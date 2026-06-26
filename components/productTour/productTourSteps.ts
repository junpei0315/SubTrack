import type { Href } from 'expo-router';

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export type BubblePlacement = 'above' | 'below';

export interface ProductTourStep {
  id: string;
  route: Href;
  title: string;
  body: string;
  bubblePlacement: BubblePlacement;
  /** 計測アンカー ID。未指定時はスポットライトなし（CTA ステップ）。 */
  anchorId?: string;
  /** アンカー計測前のフォールバック（画面中央付近など）。 */
  fallbackHighlight?: HighlightRect;
}

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    id: 'overview',
    route: '/(tabs)/home',
    anchorId: 'monthly-spending',
    title: 'SubTrack へようこそ',
    body: 'サブスクを登録すると、月々の支出をここで一元管理できます。',
    bubblePlacement: 'below',
  },
  {
    id: 'calendar',
    route: '/(tabs)/home',
    anchorId: 'payment-calendar',
    title: '支払い日をカレンダーで確認',
    body: '更新日や支払い日をタップすると、その日のサブスク一覧が見られます。',
    bubblePlacement: 'above',
  },
  {
    id: 'analytics',
    route: '/(tabs)/analytics',
    anchorId: 'analytics-summary',
    title: '支出の分析',
    body: '使用状況に応じて、どこでいくら抑えられるかを分析できます。',
    bubblePlacement: 'below',
  },
  {
    id: 'notifications',
    route: '/(tabs)/home',
    anchorId: 'header-notifications',
    title: 'リマインド通知',
    body: '支払い日などのタイミングで、ヘッダーのベルから通知を受け取れます。',
    bubblePlacement: 'below',
  },
  {
    id: 'usage-heatmap',
    route: '/(tabs)/subscriptions',
    anchorId: 'usage-heatmap',
    title: '使用状況を記録',
    body: 'サブスク詳細では草グラフのように、使った日を記録できます。分析の精度向上に役立ちます。',
    bubblePlacement: 'below',
  },
  {
    id: 'line',
    route: '/(tabs)/settings/line-link',
    anchorId: 'line-link-card',
    title: 'LINE で使用状況を記録',
    body: 'LINE 公式アカウントからアプリを開かずに「使った / 使ってない」を記録できます。',
    bubblePlacement: 'below',
  },
  {
    id: 'register-subs',
    route: '/(tabs)/home',
    title: 'では、サブスクリプションを登録しましょう',
    body: 'いま使っているサブスクを選んで、まとめて登録できます。あとからいつでも変更できます。',
    bubblePlacement: 'below',
  },
];
