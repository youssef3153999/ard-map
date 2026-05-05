'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [lands, setLands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLands()
  }, [])

  const fetchLands = async () => {
    const { data } = await supabase
      .from('lands')
      .select('*, profiles(full_name, phone)')
      .order('created_at', { ascending: false })
    setLands(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string, reason?: string) => {
    await supabase
      .from('lands')
      .update({ status, reject_reason: reason || null })
      .eq('id', id)
    fetchLands()
  }

  const statusColor: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
  }

  const statusLabel: any = {
    pending: 'قيد المراجعة',
    published: 'منشور',
    rejected: 'مرفوض',
    draft: 'مسودة',
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>

  return (
    <main className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">لوحة الأدمن</h1>
            <p className="text-gray-500 text-sm">{lands.length} إعلان إجمالاً</p>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              {lands.filter(l => l.status === 'pending').length} قيد المراجعة
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {lands.filter(l => l.status === 'published').length} منشور
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {lands.map(land => (
            <div key={land.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{land.title}</h2>
                  <p className="text-gray-500 text-sm">{land.location_text}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[land.status]}`}>
                  {statusLabel[land.status]}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="font-bold text-gray-800">{land.area_sqm} م²</div>
                  <div className="text-gray-500">المساحة</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="font-bold text-gray-800">{land.price?.toLocaleString()}</div>
                  <div className="text-gray-500">السعر</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="font-bold text-gray-800">{land.profiles?.full_name}</div>
                  <div className="text-gray-500">{land.profiles?.phone}</div>
                </div>
              </div>

              {land.description && (
                <p className="text-gray-600 text-sm mb-4 bg-gray-50 rounded-xl p-3">{land.description}</p>
              )}

              {land.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(land.id, 'published')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition text-sm"
                  >
                    ✓ قبول ونشر
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('سبب الرفض:')
                      if (reason) updateStatus(land.id, 'rejected', reason)
                    }}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl font-semibold hover:bg-red-100 transition text-sm"
                  >
                    ✗ رفض
                  </button>
                </div>
              )}

              {land.status === 'rejected' && land.reject_reason && (
                <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">
                  سبب الرفض: {land.reject_reason}
                </p>
              )}
            </div>
          ))}

          {lands.length === 0 && (
            <div className="text-center text-gray-400 py-20">لا توجد إعلانات بعد</div>
          )}
        </div>
      </div>
    </main>
  )
}