'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Users, Search, Loader2, Ticket, Check, X } from 'lucide-react'
import siteConfig from '@/site.config'

interface MemberProfile {
  id: string
  email: string
  name: string | null
  role: string
  is_premium_member: boolean
  digital_access_enabled: boolean
  created_at: string
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'digital_enabled' | 'digital_disabled'>('all')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/members')
    if (res.ok) {
      const data = await res.json()
      setMembers(data)
    }
    setLoading(false)
  }

  const toggleDigitalAccess = async (memberId: string, enabled: boolean) => {
    setUpdating(memberId)
    const res = await fetch(`/api/admin/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digital_access_enabled: enabled }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, ...updated } : m))
      )
    }
    setUpdating(null)
  }

  const filtered = members.filter((m) => {
    const matchSearch = !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ||
      (filter === 'digital_enabled' && m.digital_access_enabled) ||
      (filter === 'digital_disabled' && !m.digital_access_enabled)
    return matchSearch && matchFilter
  })

  const digitalEnabledCount = members.filter((m) => m.digital_access_enabled).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会員権限管理</h1>
          <p className="text-sm text-gray-500 mt-1">デジタルチケット・NFTの利用権限を管理します</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">デジタル権限付与済み</p>
          <p className="text-2xl font-bold text-gray-900">{digitalEnabledCount}人</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前またはメールで検索..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { value: 'all' as const, label: 'すべて' },
            { value: 'digital_enabled' as const, label: 'デジタル権限あり' },
            { value: 'digital_disabled' as const, label: 'デジタル権限なし' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.value
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
          </div>
        ) : filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">会員</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">ロール</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">{siteConfig.features.membershipName}</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Ticket size={14} />
                    デジタル権限
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">登録日</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.name ?? '名前未設定'}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      member.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : member.role === 'partner'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.is_premium_member ? (
                      <span className="text-xs font-bold" style={{ color: 'var(--color-member)' }}>{siteConfig.features.membershipName}</span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.digital_access_enabled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <Check size={12} />
                        有効
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <X size={12} />
                        無効
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleDigitalAccess(member.id, !member.digital_access_enabled)}
                      disabled={updating === member.id}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50 ${
                        member.digital_access_enabled
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {updating === member.id
                        ? '更新中...'
                        : member.digital_access_enabled
                        ? '権限を取消'
                        : '権限を付与'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p>{search ? '該当する会員が見つかりません' : '会員はまだいません'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
