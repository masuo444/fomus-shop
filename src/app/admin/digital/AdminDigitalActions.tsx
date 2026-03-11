'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  itemId: string
  itemName: string
}

export default function AdminDigitalActions({ itemId, itemName }: Props) {
  const [copied, setCopied] = useState(false)

  const itemUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/digital/${itemId}`
      : `/digital/${itemId}`

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/digital/${itemId}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = `${window.location.origin}/digital/${itemId}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={handleCopyLink}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
        title="リンクをコピー"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
      <Link
        href={`/digital/${itemId}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
        title="プレビュー"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>
      <Link
        href={`/admin/digital/${itemId}`}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        編集
      </Link>
    </div>
  )
}
