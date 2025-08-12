import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from '../app.tsx';

// Minimal smoke: renders layout & nav links

describe('AppLayout', () => {
  it('renders nav links', () => {
    render(<MemoryRouter><AppLayout /></MemoryRouter>);
  expect(!!screen.getByText(/Dashboard/i)).toBe(true);
  });
});
