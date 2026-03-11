'use client'

import { Star } from 'lucide-react'
import { RANK_LABELS } from '@/lib/types'
import type { Profile } from '@/lib/types'

interface RankBadgeProps {
  rank: Profile['rank']
  size?: 'sm' | 'md' | 'lg'
}

const RANK_STYLES: Record<Profile['rank'], { bg: string; text: string; border: string }> = {
  bronze: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
  },
  silver: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-300',
  },
  gold: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-400',
  },
  premium: {
    bg: 'bg-gradient-to-r from-purple-50 to-teal-50',
    text: 'text-purple-700',
    border: 'border-purple-400',
  },
}

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

const ICON_SIZES = {
  sm: 10,
  md: 12,
  lg: 14,
}

export default function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const style = RANK_STYLES[rank]
  const sizeClass = SIZE_CLASSES[size]

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClass}`}
    >
      {rank === 'premium' && <Star size={ICON_SIZES[size]} className="fill-current" />}
      {RANK_LABELS[rank]}
    </span>
  )
}
