import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../app.tsx';

describe('SideNav navigation', () => {
  it('renders links and navigates between routes', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
            <Route path="sipoc" element={<div>SIPOC Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // link is present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    fireEvent.click(screen.getByText('SIPOC'));
    expect(await screen.findByText('SIPOC Content')).toBeInTheDocument();
  });
});

