import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ClientsRoute from '../routes/clients.tsx';

vi.mock('../services/api.ts', () => ({
  getClientsOverview: vi.fn(() => Promise.resolve({ data: [] })),
}));

describe('Clients route', () => {
  it('renders overview heading', async () => {
    render(
      <MemoryRouter initialEntries={['/clients']}>
        <Routes>
          <Route path="/clients" element={<ClientsRoute />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('Clients Overview')).toBeInTheDocument();
  });
});
