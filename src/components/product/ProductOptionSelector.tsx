'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import type { ProductOption } from '@/lib/types'
import type { SelectedOptions } from '@/lib/cart'

interface Props {
  options: ProductOption[]
  selectedOptions: SelectedOptions
  onOptionsChange: (options: SelectedOptions) => void
  currency?: 'jpy' | 'eur'
}

export default function ProductOptionSelector({ options, selectedOptions, onOptionsChange, currency = 'jpy' }: Props) {
  const [openInfo, setOpenInfo] = useState<string | null>(null)

  const sortedOptions = [...options].sort((a, b) => a.sort_order - b.sort_order)

  const handleSelect = (option: ProductOption, choiceId: string) => {
    const choice = option.choices?.find(c => c.id === choiceId)
    if (!choice) return

    const newOptions = { ...selectedOptions }
    if (choiceId === '') {
      delete newOptions[option.name]
    } else {
      newOptions[option.name] = {
        choiceId: choice.id,
        label: choice.label,
        priceAdjustment: choice.price_adjustment,
      }
    }
    onOptionsChange(newOptions)
  }

  return (
    <div className="space-y-5">
      {sortedOptions.map((option) => {
        const sortedChoices = [...(option.choices || [])].sort((a, b) => a.sort_order - b.sort_order)
        const selected = selectedOptions[option.name]
        const isRequired = option.required

        return (
          <div key={option.id}>
            <div className="flex items-center gap-2 mb-2.5">
              <label className="text-sm font-medium text-gray-900">
                {option.name}
              </label>
              {isRequired && (
                <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                  必須
                </span>
              )}
            </div>

            {sortedChoices.length <= 5 ? (
              /* Card-style for few choices */
              <div className="grid grid-cols-1 gap-2">
                {!isRequired && (
                  <button
                    onClick={() => handleSelect(option, '')}
                    className={`text-left px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                      !selected
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">なし</span>
                  </button>
                )}
                {sortedChoices.map((choice) => {
                  const isSelected = selected?.choiceId === choice.id
                  const isOutOfStock = choice.stock !== null && choice.stock <= 0

                  return (
                    <button
                      key={choice.id}
                      onClick={() => !isOutOfStock && handleSelect(option, choice.id)}
                      disabled={isOutOfStock}
                      className={`text-left px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                        isSelected
                          ? 'border-black bg-gray-50'
                          : isOutOfStock
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-black' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                          </div>
                          <span className={isOutOfStock ? 'text-gray-400' : 'text-gray-900'}>
                            {choice.label}
                          </span>
                          {isOutOfStock && (
                            <span className="text-[10px] text-red-400 font-medium">品切れ</span>
                          )}
                        </div>
                        {choice.price_adjustment !== 0 && (
                          <span className={`text-xs font-medium ${choice.price_adjustment > 0 ? 'text-gray-600' : 'text-green-600'}`}>
                            {choice.price_adjustment > 0 ? '+' : ''}{formatPrice(choice.price_adjustment, currency)}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Dropdown for many choices */
              <select
                value={selected?.choiceId || ''}
                onChange={(e) => handleSelect(option, e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
              >
                {!isRequired && <option value="">選択しない</option>}
                {isRequired && !selected && <option value="">選択してください</option>}
                {sortedChoices.map((choice) => {
                  const isOutOfStock = choice.stock !== null && choice.stock <= 0
                  return (
                    <option key={choice.id} value={choice.id} disabled={isOutOfStock}>
                      {choice.label}
                      {choice.price_adjustment !== 0
                        ? ` (${choice.price_adjustment > 0 ? '+' : ''}${formatPrice(choice.price_adjustment, currency)})`
                        : ''}
                      {isOutOfStock ? ' - 品切れ' : ''}
                    </option>
                  )
                })}
              </select>
            )}
          </div>
        )
      })}
    </div>
  )
}
