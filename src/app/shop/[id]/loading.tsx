export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-10 bg-gray-200 rounded" />
        <div className="h-3 w-2 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-2 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="bg-gray-200 rounded-lg w-full aspect-square" />

        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-7 w-32 bg-gray-200 rounded mt-4" />
          <div className="h-4 w-24 bg-gray-200 rounded" />

          <div className="space-y-2 mt-6">
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 rounded" />
            <div className="h-3 w-4/6 bg-gray-200 rounded" />
          </div>

          <div className="mt-8">
            <div className="h-12 w-full bg-gray-200 rounded-2xl" />
          </div>

          <div className="space-y-2 mt-6">
            <div className="h-3 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-52 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
