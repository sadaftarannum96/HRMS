import React from 'react';
import {render, Simulate, cleanup} from '@testing-library/react';
import Box from './box';
import '@testing-library/jest-dom/extend-expect';

afterEach(cleanup);
describe('Box', () => {
  it('should contains name with prop change', () => {
    const {getByText, rerender} = render(<Box name="Antony" />);
    getByText('Antony');
    rerender(<Box name="Budi" />);
    getByText('Budi');
  });
});
