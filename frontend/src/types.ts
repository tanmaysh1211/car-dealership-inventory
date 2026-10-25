export type Role = 'USER' | 'ADMIN';

export interface User { id: number; name: string; email: string; role: Role }

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

/** Filter inputs are kept as strings because they come straight from form fields. */
export interface Filters { make: string; model: string; category: string; minPrice: string; maxPrice: string }

export const EMPTY_FILTERS: Filters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };
