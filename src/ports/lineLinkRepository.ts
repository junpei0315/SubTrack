/**
 * LINE 連携に関する永続化の抽象。
 * 連携の確定・利用記録は Edge Function（service_role）側で行うため、
 * アプリ側は「連携コードの発行」と「連携状態の参照/解除」だけを担う。
 */

export interface LineLinkRepository {
  /** 連携用ワンタイムコード（6 桁）を発行して返す。 */
  issueLinkCode(): Promise<string>;
  /** 連携済みかどうかを返す。 */
  isLinked(): Promise<boolean>;
  /** 連携を解除する。 */
  unlink(): Promise<void>;
}
