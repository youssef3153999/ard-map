'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewLand() {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const drawnLayerRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [polygon, setPolygon] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    area_sqm: '',
    price: '',
    location_text: '',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return

    const L = require('leaflet')

    const map = L.map(mapRef.current).setView([34.8862, 35.8836], 13)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    const drawnLayer = L.featureGroup().addTo(map)
    drawnLayerRef.current = drawnLayer

    let points: any[] = []
    let tempLayer: any = null

    map.on('click', (e: any) => {
      points.push([e.latlng.lat, e.latlng.lng])
      
      if (tempLayer) map.removeLayer(tempLayer)
      
      if (points.length >= 3) {
        tempLayer = L.polygon(points, { color: '#16a34a', weight: 2 }).addTo(map)
        setPolygon(points)
      } else {
        tempLayer = L.polyline(points, { color: '#16a34a', weight: 2 }).addTo(map)
      }
    })

    const resetBtn = L.control({ position: 'topright' })
    resetBtn.onAdd = () => {
      const btn = L.DomUtil.create('button')
      btn.innerHTML = 'مسح الرسم'
      btn.style.cssText = 'background:white;border:1px solid #ccc;padding:6px 12px;border-radius:8px;cursor:pointer;font-family:sans-serif'
      btn.onclick = () => {
        points = []
        if (tempLayer) map.removeLayer(tempLayer)
        tempLayer = null
        setPolygon(null)
      }
      return btn
    }
    resetBtn.addTo(map)

  }, [])

  const handleSubmit = async () => {
    if (!polygon) {
      setError('يرجى رسم حدود الأرض على الخريطة أولاً')
      return
    }
    if (!form.title) {
      setError('يرجى إدخال عنوان الإعلان')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('lands').insert({
      owner_id: user.id,
      title: form.title,
      description: form.description,
      area_sqm: Number(form.area_sqm),
      price: Number(form.price),
      location_text: form.location_text,
      status: 'pending',
      lat: polygon[0][0],
      lng: polygon[0][1],
    })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-right">إضافة أرض جديدة</h1>
          <p className="text-gray-500 text-sm text-right mb-6">انقر على الخريطة لرسم حدود الأرض — انقر على الأقل 3 نقاط</p>

          {error && <p className="text-red-500 text-sm mb-4 text-right">{error}</p>}

          {/* الخريطة */}
          <div ref={mapRef} style={{ height: '400px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }} />

          {polygon && (
            <p className="text-green-600 text-sm text-right mb-4">✓ تم رسم الحدود — {polygon.length} نقطة</p>
          )}

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="عنوان الإعلان"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
            />
            <textarea
              placeholder="وصف الأرض"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={3}
              className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500 resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="المساحة م²"
                value={form.area_sqm}
                onChange={e => setForm({...form, area_sqm: e.target.value})}
                className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
              />
              <input
                type="number"
                placeholder="السعر"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
              />
            </div>
            <input
              type="text"
              placeholder="الموقع — مثال: طرطوس، حي الزاهرة"
              value={form.location_text}
              onChange={e => setForm({...form, location_text: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 text-right outline-none focus:border-green-500"
            />
            <div className="flex gap-4 mt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}