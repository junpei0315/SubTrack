import type { Subscription } from '@/src/domain/subscription';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

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
        cycle: 'monthly',
      },
      nextBillingDate: new Date(year, month - 1, 20),
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
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

export const subscriptionRepositoryMock: SubscriptionRepository = {
  async findByBillingMonth(year: number, month: number): Promise<Subscription[]> {
    return buildMockSubscriptions(year, month);
  },
};
