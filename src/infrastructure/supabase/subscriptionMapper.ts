import { parseLocalDate } from '@/src/domain/localDate';
import type { Plan, Subscription } from '@/src/domain/subscription';

const VALID_CYCLES = new Set<Plan['cycle']>(['monthly', 'yearly', 'weekly']);
const VALID_STATUSES = new Set<Subscription['status']>(['active', 'paused', 'cancelled']);

function toBillingCycle(name: string): Plan['cycle'] {
  if (VALID_CYCLES.has(name as Plan['cycle'])) {
    return name as Plan['cycle'];
  }
  throw new Error(`Unknown billing cycle: ${name}`);
}

function toSubscriptionStatus(status: string): Subscription['status'] {
  if (VALID_STATUSES.has(status as Subscription['status'])) {
    return status as Subscription['status'];
  }
  throw new Error(`Unknown subscription status: ${status}`);
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T {
  if (value == null) {
    throw new Error('Expected related record but got null');
  }
  return Array.isArray(value) ? value[0] : value;
}

export const SUBSCRIPTION_SELECT = `
  id,
  user_id,
  plan_id,
  next_billing_date,
  start_date,
  status,
  created_at,
  updated_at,
  plans (
    id,
    service_id,
    name,
    price,
    currency,
    cycles ( name ),
    services (
      id,
      name,
      logo_uri,
      icon_name,
      categories ( name )
    )
  )
`;

export function mapSubscriptionRow(row: Record<string, unknown>): Subscription {
  const plan = unwrapRelation(
    row.plans as
      | {
          id: string;
          service_id: string;
          name: string;
          price: number;
          currency: string;
          cycles: { name: string } | { name: string }[];
          services:
            | {
                id: string;
                name: string;
                logo_uri: string | null;
                icon_name: string | null;
                categories: { name: string } | { name: string }[];
              }
            | {
                id: string;
                name: string;
                logo_uri: string | null;
                icon_name: string | null;
                categories: { name: string } | { name: string }[];
              }[];
        }
      | {
          id: string;
          service_id: string;
          name: string;
          price: number;
          currency: string;
          cycles: { name: string } | { name: string }[];
          services:
            | {
                id: string;
                name: string;
                logo_uri: string | null;
                icon_name: string | null;
                categories: { name: string } | { name: string }[];
              }
            | {
                id: string;
                name: string;
                logo_uri: string | null;
                icon_name: string | null;
                categories: { name: string } | { name: string }[];
              }[];
        }[]
  );

  const cycle = unwrapRelation(plan.cycles);
  const service = unwrapRelation(plan.services);
  const category = unwrapRelation(service.categories);

  return {
    id: row.id as string,
    userId: row.user_id as string,
    planId: row.plan_id as string,
    service: {
      id: service.id,
      name: service.name,
      logoUri: service.logo_uri ?? undefined,
      iconName: service.icon_name ?? undefined,
      category: category.name,
    },
    plan: {
      id: plan.id,
      serviceId: plan.service_id,
      name: plan.name,
      price: Number(plan.price),
      currency: plan.currency,
      cycle: toBillingCycle(cycle.name),
    },
    nextBillingDate: parseLocalDate(row.next_billing_date as string),
    startDate: parseLocalDate(row.start_date as string),
    status: toSubscriptionStatus(row.status as string),
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at
      ? new Date(row.updated_at as string)
      : new Date(row.created_at as string),
  };
}
