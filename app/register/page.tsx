'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        role: 'seller',
      })
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">حساب جديد</h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
          />
          <input
            type="text"
            placeholder="رقم الهاتف"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
          </button>

          <Link href="/login" className="text-center text-sm text-gray-500 hover:text-green-600">
            لديك حساب؟ سجل الدخول
          </Link>
        </div>
      </div>
    </main>
  )
}