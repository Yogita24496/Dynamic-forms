test('renders main app heading', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /Dynamic Form Creation App/i });
  expect(headingElement).toBeInTheDocument();
});
