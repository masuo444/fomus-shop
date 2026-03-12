export async function fetchAddressFromPostalCode(postalCode: string): Promise<string | null> {
  // Remove hyphens and spaces
  const cleaned = postalCode.replace(/[-\s]/g, '')
  if (cleaned.length !== 7 || !/^\d{7}$/.test(cleaned)) return null

  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleaned}`)
    const data = await res.json()
    if (data.status === 200 && data.results && data.results.length > 0) {
      const result = data.results[0]
      return `${result.address1}${result.address2}${result.address3}`
    }
    return null
  } catch {
    return null
  }
}
