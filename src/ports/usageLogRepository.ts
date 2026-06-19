/**
 * 利用ログ（usage_logs）の永続化に対する抽象。
 * F-08（利用チェック）/ F-09（利用頻度）で使用する。
 * 日付は端末ローカルの 'YYYY-MM-DD'（domain/localDate の形式）で受け渡す。
 */

export interface AddUsedDateParams {
  userId: string;
  subscriptionId: string;
  usedDate: string;
}

export interface RemoveUsedDateParams {
  subscriptionId: string;
  usedDate: string;
}

export interface UsageLogRow {
  subscriptionId: string;
  usedDate: string;
}

export interface UsageLogRepository {
  /** 指定サブスクの利用日（'YYYY-MM-DD'）一覧を返す。 */
  listUsedDatesBySubscription(subscriptionId: string): Promise<string[]>;
  /** ユーザーの全利用ログ（subscriptionId + usedDate）を返す。 */
  listUsedDatesByUserId(userId: string): Promise<UsageLogRow[]>;
  /** 利用日を記録する。同日重複は無視する（冪等）。 */
  addUsedDate(params: AddUsedDateParams): Promise<void>;
  /** 利用日の記録を取り消す。 */
  removeUsedDate(params: RemoveUsedDateParams): Promise<void>;
}
