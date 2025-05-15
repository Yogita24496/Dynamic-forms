import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Dynamic Form Creation App heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Dynamic Form Creation App/i);
  expect(headingElement).toBeInTheDocument();
});
