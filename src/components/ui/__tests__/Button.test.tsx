import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  it('renders with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    const button = getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('btn-primary')
  })

  it('renders with different variants', () => {
    const { getByRole, rerender } = render(<Button variant="secondary">Secondary</Button>)
    expect(getByRole('button')).toHaveClass('btn-secondary')

    rerender(<Button variant="accent">Accent</Button>)
    expect(getByRole('button')).toHaveClass('btn-accent')

    rerender(<Button variant="outline">Outline</Button>)
    expect(getByRole('button')).toHaveClass('btn-outline')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(getByRole('button')).toHaveClass('btn-ghost')
  })

  it('renders with different sizes', () => {
    const { getByRole, rerender } = render(<Button size="sm">Small</Button>)
    expect(getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(getByRole('button')).toHaveClass('px-8', 'py-4', 'text-lg')
  })

  it('shows loading state', () => {
    const { getByRole } = render(<Button isLoading>Loading</Button>)
    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toContainHTML('animate-spin')
  })

  it('renders with left and right icons', () => {
    const leftIcon = <span data-testid="left-icon">←</span>
    const rightIcon = <span data-testid="right-icon">→</span>
    
    const { getByTestId } = render(
      <Button leftIcon={leftIcon} rightIcon={rightIcon}>
        With Icons
      </Button>
    )
    
    expect(getByTestId('left-icon')).toBeInTheDocument()
    expect(getByTestId('right-icon')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>)
    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  it('applies custom className', () => {
    const { getByRole } = render(<Button className="custom-class">Custom</Button>)
    const button = getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})