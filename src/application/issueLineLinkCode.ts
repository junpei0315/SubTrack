import type { LineLinkRepository } from '@/src/ports/lineLinkRepository';

/**
 * LINE 連携用のワンタイムコードを発行する。
 * 発行されたコードをユーザーが LINE 公式アカウントに送ると連携が確定する。
 */
export async function issueLineLinkCode(repository: LineLinkRepository): Promise<string> {
  return repository.issueLinkCode();
}
