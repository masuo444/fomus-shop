import type { Metadata } from 'next'
import ContactClient from '@/app/contact/ContactClient'
import { FAQPageJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact FOMUS. Questions about products, shipping, or custom orders? Get in touch with us here.',
  alternates: {
    canonical: '/en/contact',
    languages: {
      ja: '/contact',
      en: '/en/contact',
    },
  },
  openGraph: {
    locale: 'en_US',
    title: 'Contact Us',
    description: 'Contact FOMUS. Questions about products, shipping, or custom orders? Get in touch with us here.',
    url: 'https://shop.fomus.jp/en/contact',
  },
}

const faqItems = [
  {
    question: 'How soon will my order ship?',
    answer: 'Orders ship within 7 business days after payment is confirmed. International delivery times vary by destination.',
  },
  {
    question: 'Can I return or exchange an item?',
    answer: 'Returns and exchanges are accepted within 7 days of delivery for unused items only. For returns due to customer preference, return shipping is at the customer\'s expense. Defective items will be exchanged with shipping covered by us.',
  },
  {
    question: 'Can I ask about custom-made orders?',
    answer: 'Yes — please select "Custom orders & collaborations" in the contact form and tell us about your idea.',
  },
  {
    question: 'How long does it take to get a reply?',
    answer: 'We reply within 2 business days.',
  },
]

export default function ContactPage() {
  return (
    <>
      <FAQPageJsonLd items={faqItems} />
      <ContactClient locale="en" />
    </>
  )
}
