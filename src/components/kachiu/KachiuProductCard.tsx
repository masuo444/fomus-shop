import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { productPath } from '@/lib/utils'
import KachiuAddToCart from './KachiuAddToCart'
import KachiuLabel, { splitName } from './KachiuLabel'

// KACHIU の商品カード。「品書き」の一項として組む。
// 上：ビジュアル（写真があれば写真、無ければCSSで描いたラベル）
// 下：名・一行・価格・カートに入れる
//
// 写真が入るまでの間、空のグレー枠を見せない。kachiu.jp のモックと同じ語法で
// 和紙のラベルを描き、写真が届いたら同じ枠にそのまま差し替える。

export default function KachiuProductCard({ product, index = 0, priority = false }: { product: Product; index?: number; priority?: boolean }) {
  const href = productPath(product)
  const hasImage = Array.isArray(product.images) && product.images.length > 0
  const isSoldOut = product.stock === 0 && !product.made_to_order && !product.external_url
  const isExternal = !!product.external_url
  const { main, sub } = splitName(product.name)

  // 説明文の1行目だけを「一行」として使う（長い説明は詳細ページに）
  const oneLine = (product.description || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean) || ''

  return (
    <article className="group flex flex-col">
      <Link href={href} className="block relative overflow-hidden" style={{ aspectRatio: '4 / 5' }} aria-label={`${product.name} の詳細`}>
        {hasImage ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {product.images[1] && (
              <Image
                src={product.images[1]}
                alt=""
                fill
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.02]">
            <KachiuLabel name={product.name} index={index} />
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[var(--background)]/55 flex items-center justify-center">
            <span className="text-[11px] tracking-[0.3em] text-[var(--foreground)]" style={{ textIndent: '0.3em' }}>完売</span>
          </div>
        )}
      </Link>

      {/* 品書き */}
      <div className="pt-6 md:pt-7 flex flex-col flex-1">
        <h3 className="leading-[1.5] min-h-[calc(14px*1.5*2)] md:min-h-[calc(17px*1.5*2)]">
          <Link href={href} className="text-[var(--foreground)] hover:text-[var(--color-accent)] transition-colors">
            <span className="block text-[14px] md:text-[17px] tracking-[0.04em] md:tracking-[0.06em]" style={{ fontFamily: 'var(--font-noto-serif-jp, "Noto Serif JP", serif)', fontWeight: 500 }}>
              {main}{sub ? <span className="text-[var(--color-muted)] font-normal">{/^\d/.test(main) || !/コンフィチュール|セット/.test(sub) ? `　${sub}` : `の${sub}`}</span> : null}
            </span>
          </Link>
        </h3>
        {/* 一行は2行分の高さを常に確保して、価格とボタンの位置をカード間で揃える */}
        <p className="mt-2 md:mt-2.5 text-[11.5px] md:text-[12.5px] leading-[1.8] md:leading-[1.9] text-[var(--color-muted)] line-clamp-2 min-h-[calc(11.5px*1.8*2)] md:min-h-[calc(12.5px*1.9*2)]">
          {oneLine}
        </p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-serif text-[18px] md:text-[22px] text-[var(--foreground)] tabular-nums" style={{ letterSpacing: '0.02em' }}>
            ¥{product.price.toLocaleString()}
          </span>
          <span className="text-[10.5px] tracking-[0.12em] text-[var(--color-muted)]">税込</span>
        </div>

        <div className="mt-auto">
          {isExternal ? (
            <a
              href={product.external_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex h-10 md:h-11 w-full items-center justify-center border border-[var(--foreground)] text-[12px] tracking-[0.2em] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
              style={{ textIndent: '0.2em' }}
            >
              販売サイトへ
            </a>
          ) : (
            <KachiuAddToCart
              productId={product.id}
              shopId={product.shop_id}
              stock={product.stock}
              price={product.price}
              productName={product.name}
              madeToOrder={product.made_to_order}
              quantityLimit={product.quantity_limit}
            />
          )}
        </div>
      </div>
    </article>
  )
}
