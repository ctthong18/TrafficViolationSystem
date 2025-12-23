import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home', () => {
    it('renders the dashboard heading', () => {
        render(<Home />)
        // Check if the Dashboard heading exists
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })
})
