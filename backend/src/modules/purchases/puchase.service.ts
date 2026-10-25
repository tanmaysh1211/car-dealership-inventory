import * as repo from './purchase.repository';

export const listMyPurchases = (userId: number) => repo.findByUser(userId);