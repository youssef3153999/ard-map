'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [lands, setLands] = useState<any[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(profileData)

      const { data: landsData } = await supabase
        .from('lands')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
      setLands(landsData || [])
    }
    checkUser()
  }, [])

  const statusLabel: any = {
    pending: 'قيد المراجعة',
    published: 'منشور',
    rejected: 'مرفوض',
    draft: 'مسودة',
  }

  const statusColor: any = {
    pending: '#f59e0b',
    published: '#16a34a',
    rejected: '#ef4444',
    draft: '#9ca3af',
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مرحباً {profile?.full_name || profile?.phone || '...'}
            </h1>
            <p className="text-gray-500 text-sm">لوحة التحكم</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              لوحة الأدمن
            </button>
            <button
              onClick={() => router.push('/lands/new')}
              className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition"
            >
              + إضافة أرض
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-gray-800">{lands.length}</div>
            <div className="text-gray-500 text-sm mt-1">إجمالي الإعلانات</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {lands.filter(l => l.status === 'published').length}
            </div>
            <div className="text-gray-500 text-sm mt-1">منشور</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {lands.filter(l => l.status === 'pending').length}
            </div>
            <div className="text-gray-500 text-sm mt-1">قيد المراجعة</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {lands.map(land => (
            <div key={land.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{land.title}</h2>
                  <p className="text-gray-500 text-sm">{land.location_text}</p>
                </div>
                <span style={{
                  background: statusColor[land.status] + '20',
                  color: statusColor[land.status],
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
                }}>
                  {statusLabel[land.status]}
                </span>
              </div>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>📐 {land.area_sqm} م²</span>
                <span>💰 {land.price?.toLocaleString()} ل.س</span>
              </div>
              {land.status === 'rejected' && land.reject_reason && (
                <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-xl p-3">
                  سبب الرفض: {land.reject_reason}
                </p>
              )}
            </div>
          ))}

          {lands.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              لا توجد إعلانات بعد — أضف أرضك الأولى!
            </div>
          )}
        </div>
      </div>
    </main>
  )
}