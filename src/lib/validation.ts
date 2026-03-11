/** Clamp a number between min and max, returning defaultVal if NaN */
export function clampNumber(val: unknown, min: number, max: number, defaultVal: number): number {
  const n = Number(val)
  if (isNaN(n) || !isFinite(n)) return defaultVal
  return Math.min(Math.max(n, min), max)
}

/** Truncate string to maxLength, return empty string if not a string */
export function sanitizeString(val: unknown, maxLength: number): string {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, maxLength)
}

/** Validate that a value is a non-empty string */
export function requireString(val: unknown, fieldName: string): string {
  if (typeof val !== 'string' || val.trim().length === 0) {
    throw new ValidationError(`${fieldName}は必須です`)
  }
  return val.trim()
}

/** Validate slug format (lowercase alphanumeric + hyphens) */
export function validateSlug(val: string): string {
  const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (slug.length === 0 || slug.length > 50) {
    throw new ValidationError('スラッグは1〜50文字の英数字とハイフンで入力してください')
  }
  return slug
}

/** Validate email format */
export function validateEmail(val: unknown): string {
  if (typeof val !== 'string') throw new ValidationError('メールアドレスが無効です')
  const email = val.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('メールアドレスの形式が無効です')
  }
  return email
}

/** Validate positive integer */
export function validatePositiveInt(val: unknown, fieldName: string): number {
  const n = Number(val)
  if (isNaN(n) || !isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new ValidationError(`${fieldName}は0以上の整数で入力してください`)
  }
  return n
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
