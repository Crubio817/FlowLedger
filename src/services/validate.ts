// Zod validation for API responses (template)
import { z } from 'zod';
// import type { components } from './types.gen';

// Example: define zod schema for Client (replace with actual fields after generation)
export const ClientSchema = z.object({
  client_id: z.number(),
  name: z.string(),
  // ...add fields as per generated types
});

// Usage:
// const parsed = ClientSchema.parse(apiResponse)
// If you want to validate arrays:
// const parsed = z.array(ClientSchema).parse(apiResponse)

// Add more schemas as needed after types.gen.ts is generated
