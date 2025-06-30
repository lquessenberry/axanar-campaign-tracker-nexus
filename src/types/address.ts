export interface Address {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  donor_id: string | null;
  is_primary: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateAddressInput {
  donorId: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_primary?: boolean;
}

export interface UpdateAddressInput {
  id: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  is_primary?: boolean;
}
