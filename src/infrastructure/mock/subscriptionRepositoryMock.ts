import type { Subscription } from '@/src/domain/subscription';
import type {
  CreateSubscriptionInput,
  SubscriptionRepository,
  UpdateSubscriptionStatusInput,
} from '@/src/ports/subscriptionRepository';

function buildMockSubscriptions(year: number, month: number): Subscription[] {
  return [
    {
      id: 'sub-1',
      userId: 'user-1',
      planId: 'plan-1',
      service: {
        id: 'service-netflix',
        name: 'Netflix',
        iconName: 'play-circle',
        category: 'video',
      },
      plan: {
        id: 'plan-1',
        serviceId: 'service-netflix',
        name: 'Premium',
        price: 1490,
        currency: 'JPY',
        cycle: 'monthly',
      },
      nextBillingDate: new Date(year, month - 1, 5),
      startDate: new Date(2021, 8, 24),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sub-2',
      userId: 'user-1',
      planId: 'plan-2',
      service: {
        id: 'service-spotify',
        name: 'Spotify',
        iconName: 'music',
        category: 'music',
      },
      plan: {
        id: 'plan-2',
        serviceId: 'service-spotify',
        name: 'Premium',
        price: 1180,
        currency: 'JPY',
        cycle: 'monthly',
      },
      nextBillingDate: new Date(year, month - 1, 12),
      startDate: new Date(2022, 2, 1),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sub-3',
      userId: 'user-1',
      planId: 'plan-3',
      service: {
        id: 'service-adobe',
        name: 'Adobe Creative Cloud',
        iconName: 'palette',
        category: 'creative',
      },
      plan: {
        id: 'plan-3',
        serviceId: 'service-adobe',
        name: 'All Apps',
        price: 6248,
        currency: 'JPY',
        cycle: 'yearly',
      },
      nextBillingDate: new Date(year, month - 1, 20),
      startDate: new Date(2020, 5, 15),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sub-4',
      userId: 'user-1',
      planId: 'plan-4',
      service: {
        id: 'service-chatgpt',
        name: 'ChatGPT Plus',
        iconName: 'message-circle',
        category: 'ai',
      },
      plan: {
        id: 'plan-4',
        serviceId: 'service-chatgpt',
        name: 'Plus',
        price: 2000,
        currency: 'JPY',
        cycle: 'monthly',
      },
      nextBillingDate: new Date(year, month - 1, 25),
      startDate: new Date(2023, 10, 1),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

export const subscriptionRepositoryMock: SubscriptionRepository = {
  async findAll(): Promise<Subscription[]> {
    const now = new Date();
    return buildMockSubscriptions(now.getFullYear(), now.getMonth() + 1);
  },
  async findByBillingMonth(year: number, month: number): Promise<Subscription[]> {
    return buildMockSubscriptions(year, month);
  },
  async findById(id: string): Promise<Subscription | null> {
    const now = new Date();
    const all = buildMockSubscriptions(now.getFullYear(), now.getMonth() + 1);
    return all.find((sub) => sub.id === id) ?? null;
  },

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const now = new Date();
    return {
      id: `sub-mock-${now.getTime()}`,
      userId: input.userId,
      planId: input.planId,
      service: {
        id: 'svc-mock',
        name: 'Mock Service',
        iconName: 'circle',
        category: 'other',
      },
      plan: {
        id: input.planId,
        serviceId: 'svc-mock',
        name: 'Mock Plan',
        price: input.customPrice ?? 0,
        currency: 'JPY',
        cycle: 'monthly',
      },
      customPrice: input.customPrice,
      nextBillingDate: input.nextBillingDate,
      startDate: input.startDate,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateStatus(id: string, input: UpdateSubscriptionStatusInput): Promise<Subscription> {
    const now = new Date();
    const all = buildMockSubscriptions(now.getFullYear(), now.getMonth() + 1);
    const target = all.find((sub) => sub.id === id);
    if (!target) {
      throw new Error(`Subscription not found: ${id}`);
    }
    return {
      ...target,
      status: input.status,
      nextBillingDate: input.nextBillingDate ?? target.nextBillingDate,
      cancelledAt:
        input.cancelledAt === undefined
          ? target.cancelledAt
          : input.cancelledAt === null
            ? undefined
            : input.cancelledAt,
      updatedAt: now,
    };
  },

  async delete(id: string): Promise<void> {
    const now = new Date();
    const all = buildMockSubscriptions(now.getFullYear(), now.getMonth() + 1);
    const exists = all.some((sub) => sub.id === id);
    if (!exists) {
      throw new Error(`Subscription not found: ${id}`);
    }
    // モックは永続化しないため、存在確認のみ行う。
  },
};
