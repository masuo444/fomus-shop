'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon, GripVertical, Crop as CropIcon } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (urls: string[]) => void
}

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Helper: create cropped image from canvas
function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      )

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/jpeg',
        0.92
      )
    }
    image.onerror = reject
    image.src = imageSrc
  })
}

// Sortable image item
function SortableImageItem({
  url,
  index,
  onRemove,
  onCrop,
}: {
  url: string
  index: number
  onRemove: (i: number) => void
  onCrop: (i: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 ${isDragging ? 'shadow-lg ring-2 ring-member' : ''}`}
    >
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-1.5 left-1.5 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={14} />
      </button>
      {/* Crop button */}
      <button
        type="button"
        onClick={() => onCrop(index)}
        className="absolute bottom-1.5 left-1.5 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        title="正方形にトリミング"
      >
        <CropIcon size={14} />
      </button>
      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
      >
        <X size={14} />
      </button>
      {index === 0 && (
        <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
          メイン
        </span>
      )}
    </div>
  )
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Crop state
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [cropSaving, setCropSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError('')
      const fileArray = Array.from(files)

      if (images.length + fileArray.length > MAX_IMAGES) {
        setError(`画像は最大${MAX_IMAGES}枚までです`)
        return
      }

      for (const file of fileArray) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError('JPEG、PNG、WebP形式の画像のみアップロードできます')
          return
        }
        if (file.size > MAX_FILE_SIZE) {
          setError('ファイルサイズは5MB以下にしてください')
          return
        }
      }

      setUploading(true)
      setProgress(0)

      const supabase = createClient()
      const newUrls: string[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `products/${timestamp}-${safeName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          setError(`アップロードに失敗しました: ${uploadError.message}`)
          break
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)

        newUrls.push(publicUrlData.publicUrl)
        setProgress(Math.round(((i + 1) / fileArray.length) * 100))
      }

      if (newUrls.length > 0) {
        onImagesChange([...images, ...newUrls])
      }

      setUploading(false)
      setProgress(0)
    },
    [images, onImagesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [uploadFiles]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
    e.target.value = ''
  }

  const removeImage = async (index: number) => {
    const url = images[index]
    try {
      const supabase = createClient()
      const match = url.match(/product-images\/(.+)$/)
      if (match) {
        await supabase.storage.from('product-images').remove([match[1]])
      }
    } catch {
      // Ignore delete errors
    }
    onImagesChange(images.filter((_, i) => i !== index))
  }

  // Drag-and-drop reorder
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.indexOf(active.id as string)
    const newIndex = images.indexOf(over.id as string)
    if (oldIndex !== -1 && newIndex !== -1) {
      onImagesChange(arrayMove(images, oldIndex, newIndex))
    }
  }

  // Crop handlers
  const openCrop = (index: number) => {
    setCropImageIndex(index)
    setCropImageSrc(images[index])
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const onCropComplete = useCallback((_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea)
  }, [])

  const saveCrop = async () => {
    if (cropImageIndex === null || !cropImageSrc || !croppedAreaPixels) return
    setCropSaving(true)

    try {
      const blob = await getCroppedImg(cropImageSrc, croppedAreaPixels)
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' })

      const supabase = createClient()
      const path = `products/${Date.now()}-cropped.jpg`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`アップロードに失敗しました: ${uploadError.message}`)
        setCropSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      // Replace the image at the index
      const newImages = [...images]
      newImages[cropImageIndex] = publicUrlData.publicUrl
      onImagesChange(newImages)

      // Close crop modal
      setCropImageIndex(null)
      setCropImageSrc(null)
    } catch {
      setError('トリミングに失敗しました')
    } finally {
      setCropSaving(false)
    }
  }

  const cancelCrop = () => {
    setCropImageIndex(null)
    setCropImageSrc(null)
  }

  return (
    <div className="space-y-3">
      {/* Preview grid with drag-and-drop */}
      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((url, i) => (
                <SortableImageItem
                  key={url}
                  url={url}
                  index={i}
                  onRemove={removeImage}
                  onCrop={openCrop}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length > 1 && (
        <p className="text-xs text-gray-400">ドラッグで画像の順番を入れ替えできます</p>
      )}

      {/* Drop zone */}
      {images.length < MAX_IMAGES && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-member bg-member/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 size={24} className="animate-spin mx-auto text-member" />
              <p className="text-sm text-gray-600">アップロード中... {progress}%</p>
              <div className="w-48 mx-auto bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-member h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {dragOver ? (
                <Upload size={24} className="mx-auto text-member" />
              ) : (
                <ImageIcon size={24} className="mx-auto text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-600">
                  ドラッグ＆ドロップまたは
                </p>
                <button
                  type="button"
                  className="text-sm text-member hover:underline font-medium"
                >
                  画像を選択
                </button>
              </div>
              <p className="text-xs text-gray-400">
                JPEG, PNG, WebP / 最大5MB / 残り{MAX_IMAGES - images.length}枚
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Crop Modal */}
      {cropImageSrc && cropImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">正方形にトリミング</h3>
              <p className="text-xs text-gray-400 mt-1">ドラッグで位置を調整、スクロールでズーム</p>
            </div>
            <div className="relative w-full" style={{ height: 400 }}>
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="px-5 py-2">
              <label className="flex items-center gap-3 text-xs text-gray-500">
                <span>ズーム</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-member"
                />
              </label>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelCrop}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={saveCrop}
                disabled={cropSaving}
                className="px-4 py-2 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {cropSaving ? 'トリミング中...' : 'トリミングを適用'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
