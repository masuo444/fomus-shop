export default function CheckoutLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="mt-8 h-14 bg-gray-200 rounded-full" />
    </div>
  )
}
