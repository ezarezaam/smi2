export interface UOM {
  id?: number;
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const sampleUOMs = [
  { code: 'PCS', name: 'Piece', description: 'Per piece' },
  { code: 'BOX', name: 'Box', description: 'Per box' },
  { code: 'PKT', name: 'Packet', description: 'Per packet' },
  { code: 'KG', name: 'Kilogram', description: 'Kilogram' },
  { code: 'G', name: 'Gram', description: 'Gram' },
  { code: 'L', name: 'Liter', description: 'Liter' },
  { code: 'M', name: 'Meter', description: 'Meter' },
  { code: 'CM', name: 'Centimeter', description: 'Centimeter' },
  { code: 'DZN', name: 'Dozen', description: 'Per dozen' },
  { code: 'SET', name: 'Set', description: 'Per set' },
  { code: 'PAIR', name: 'Pair', description: 'Per pair' },
  { code: 'ROLL', name: 'Roll', description: 'Per roll' },
  { code: 'UNIT', name: 'Unit', description: 'Per unit' },
  { code: 'BTL', name: 'Bottle', description: 'Per bottle' },
  { code: 'CAN', name: 'Can', description: 'Per can' },
];
