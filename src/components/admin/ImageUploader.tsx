'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (urls: string[]) => void
}

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError('')
      const fileArray = Array.from(files)

      // Validate count
      if (images.length + fileArray.length > MAX_IMAGES) {
        setError(`画像は最大${MAX_IMAGES}枚までです`)
        return
      }

      // Validate each file
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
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const removeImage = async (index: number) => {
    const url = images[index]
    // Try to delete from storage
    try {
      const supabase = createClient()
      // Extract path from URL
      const match = url.match(/product-images\/(.+)$/)
      if (match) {
        await supabase.storage.from('product-images').remove([match[1]])
      }
    } catch {
      // Ignore delete errors
    }
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X size={14} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  メイン
                </span>
              )}
            </div>
          ))}
        </div>
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
    </div>
  )
}
