import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ScoreRing from '../components/ScoreRing';

describe('ScoreRing', () => {
  it('renders the score number', () => {
    render(<ScoreRing score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders 0 for falsy scores', () => {
    render(<ScoreRing score={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
