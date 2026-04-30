import { FC } from 'react'
import { cn } from '@/lib/utils'

// 1. Types
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

// 2. Component
const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  onClick,
}) => {
  const base = 'uppercase tracking-widest font-normal rounded-brand-sm transition-all duration-250'

  const variants = {
    primary:   'bg-gold-primary hover:bg-gold-deep hover:shadow-gold text-blush',
    secondary: 'border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-blush',
  }

  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-8 py-3',
    lg: 'text-base px-10 py-4',
  }

  return (
    <button
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  )
}

export default Button
