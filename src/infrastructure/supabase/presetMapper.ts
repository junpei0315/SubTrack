import type { BillingCycle } from '@/src/domain/billingCycle';
import type { PresetPlan, PresetService } from '@/src/domain/preset';

const VALID_CYCLES = new Set<BillingCycle>(['monthly', 'yearly', 'weekly']);

function toBillingCycle(name: string): BillingCycle {
  if (VALID_CYCLES.has(name as BillingCycle)) {
    return name as BillingCycle;
  }
  throw new Error(`Unknown billing cycle: ${name}`);
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | undefined {
  if (value == null) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

export const PRESET_SELECT = `
  id,
  name,
  logo_key,
  logo_uri,
  icon_name,
  categories ( name ),
  plans (
    id,
    name,
    price,
    currency,
    cycles ( name )
  )
`;

interface PlanRow {
  id: string;
  name: string;
  price: number;
  currency: string;
  cycles: { name: string } | { name: string }[] | null;
}

export function mapPresetRow(row: Record<string, unknown>): PresetService {
  const category = unwrapRelation(row.categories as { name: string } | { name: string }[] | null);
  const planRows = (row.plans as PlanRow[] | null) ?? [];

  const plans: PresetPlan[] = planRows
    .map((plan): PresetPlan | null => {
      const cycle = unwrapRelation(plan.cycles);
      if (!cycle) {
        return null;
      }
      return {
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        currency: plan.currency,
        cycle: toBillingCycle(cycle.name),
      };
    })
    .filter((plan): plan is PresetPlan => plan !== null);

  return {
    id: row.id as string,
    name: row.name as string,
    genre: category?.name ?? 'その他',
    logoKey: (row.logo_key as string | null) ?? undefined,
    logoUri: (row.logo_uri as string | null) ?? undefined,
    iconName: (row.icon_name as string | null) ?? undefined,
    plans,
  };
}
