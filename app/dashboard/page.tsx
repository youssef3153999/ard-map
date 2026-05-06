'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setProfile(data)
  }
  checkUser()
}, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            مرحباً {profile?.full_name || '...'}
          </h1>
          <p className="text-gray-500 text-sm">لوحة التحكم</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-gray-500 text-sm mt-1">إعلاناتي</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-gray-500 text-sm mt-1">استفسارات</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">0</div>
            <div className="text-gray-500 text-sm mt-1">قيد المراجعة</div>
          </div>
        </div>

        <button
          onClick={() => router.push('/lands/new')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          + إضافة أرض جديدة
        </button>
      </div>
    </main>
  )
}