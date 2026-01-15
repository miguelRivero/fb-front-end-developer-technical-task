import { render, screen } from '@testing-library/react'
import App from './App'

test('renders Photo Gallery App heading', () => {
  render(<App />)
  expect(screen.getByText(/photo gallery app/i)).toBeInTheDocument()
})
