import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">أرض ماب</h1>
        <p className="text-gray-500 mb-8">منصة بيع وشراء الأراضي في طرطوس</p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/login"
            className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            تسجيل الدخول
          </Link>
          <Link 
            href="/register"
            className="border border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            حساب جديد
          </Link>
        </div>
      </div>
    </main>
  )
}