import { Product } from './Product';

// Service is now a type alias of Product with group='Service'
// Omitting the stock field since services don't have inventory
export type Service = Omit<Product, 'stock'> & {
  // Additional service-specific fields can be added here if needed
  features?: string[];
  status?: string;
};

// Extended service type for UI components that need additional fields
export interface ExtendedService extends Service {
  image?: File | null;
  imagePreview?: string | null;
  features?: string[];
}
