import { render, screen } from '../../testUtils';
import userEvent from '@testing-library/user-event';

import React from 'react';
import CountrySelector from './CountrySelector';

describe('Country Selector Input', () => {
  it('clicking on a country calls setCountry with the selected option', async () => {
    const mockSetCountry = jest.fn();
    render(<CountrySelector country={'US'} setCountry={mockSetCountry} />);
    await userEvent.selectOptions(screen.getByTestId('select-test-id'), screen.getByText('+61 Australia'));

    expect(mockSetCountry).toHaveBeenCalledWith('AU');
  });
});
