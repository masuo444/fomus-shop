import type { Metadata } from 'next'
import ContactClient from './ContactClient'
import { FAQPageJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'FOUMSへのお問い合わせ。商品・配送・オーダーメイドに関するご質問はこちらから。',
  alternates: {
    canonical: '/contact',
  },
}

const faqItems = [
  {
    question: '注文後、どのくらいで届きますか？',
    answer: '入金確認後、7営業日以内に発送いたします。',
  },
  {
    question: '返品・交換はできますか？',
    answer: '商品到着後7日以内に限り、未使用品に限り返品・交換を承ります。お客様都合による返品の送料はお客様負担となります。不良品の場合は送料当社負担にて交換いたします。',
  },
  {
    question: 'オーダーメイドの相談はできますか？',
    answer: 'はい、お問い合わせフォームの「オーダーメイド・コラボ相談」からご相談ください。',
  },
  {
    question: 'お問い合わせの返信にはどのくらいかかりますか？',
    answer: '2営業日以内にご返信いたします。',
  },
]

export default function ContactPage() {
  return (
    <>
      <FAQPageJsonLd items={faqItems} />
      <ContactClient />
    </>
  )
}
