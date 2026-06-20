import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { LanguageProvider } from './i18n/LanguageContext'
import { ToastProvider } from './components/Toast'

describe('App', () => {
  it('renders the CareTrack login page', () => {
    const router = createMemoryRouter(
      [{ path: '/login', element: <LoginPage /> }],
      { initialEntries: ['/login'] }
    )
    render(
      <LanguageProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LanguageProvider>
    )
    expect(screen.getAllByText(/CareTrack/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Tizimga kirish/i)).toBeInTheDocument()
  })
})
