import type { PresetPlan, PresetService } from './preset';
import type { Subscription } from './subscription';

/** 解約済み以外の契約に紐づく plan_id を返す。 */
export function getRegisteredPlanIds(subscriptions: Subscription[]): Set<string> {
  return new Set(
    subscriptions.filter((subscription) => subscription.status !== 'cancelled').map((s) => s.planId)
  );
}

export function isPlanRegistered(
  planId: string,
  registeredPlanIds: ReadonlySet<string>
): boolean {
  return registeredPlanIds.has(planId);
}

/** プリセットの全プランが登録済みかどうか。 */
export function isPresetFullyRegistered(
  preset: PresetService,
  registeredPlanIds: ReadonlySet<string>
): boolean {
  return (
    preset.plans.length > 0 &&
    preset.plans.every((plan) => registeredPlanIds.has(plan.id))
  );
}

/** 未登録の最初のプラン。全て登録済みなら null。 */
export function findFirstAvailablePlan(
  plans: PresetPlan[],
  registeredPlanIds: ReadonlySet<string>
): PresetPlan | null {
  return plans.find((plan) => !registeredPlanIds.has(plan.id)) ?? null;
}
