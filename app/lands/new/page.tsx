'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewLand() {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [polygon, setPolygon] = useState<any>(null)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
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

    L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '© Google', maxZoom: 20
    }).addTo(map)

    let points: any[] = []
    let tempLayer: any = null

    map.on('click', (e: any) => {
      points.push([e.latlng.lat, e.latlng.lng])
      if (tempLayer) map.removeLayer(tempLayer)
      if (points.length >= 3) {
        tempLayer = L.polygon(points, { color: '#f03e1b', weight: 2 }).addTo(map)
        setPolygon([...points])
      } else {
        tempLayer = L.polyline(points, { color: '#f03e1b', weight: 2 }).addTo(map)
      }
    })

    const resetBtn = L.control({ position: 'topright' })
    resetBtn.onAdd = () => {
      const btn = L.DomUtil.create('button')
      btn.innerHTML = 'مسح الرسم'
      btn.style.cssText = 'background:white;border:1px solid #ccc;padding:6px 12px;border-radius:8px;cursor:pointer;font-family:Cairo,sans-serif'
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

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 6) {
      setError('الحد الأقصى 6 صور')
      return
    }
    setImages(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!polygon) { setError('يرجى رسم حدود الأرض على الخريطة أولاً'); return }
    if (!form.title) { setError('يرجى إدخال عنوان الإعلان'); return }
    if (images.length === 0) { setError('يرجى إضافة صورة واحدة على الأقل'); return }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: land, error: landError } = await supabase.from('lands').insert({
      owner_id: user.id,
      title: form.title,
      description: form.description,
      area_sqm: Number(form.area_sqm),
      price: Number(form.price),
      location_text: form.location_text,
      status: 'pending',
      lat: polygon[0][0],
      lng: polygon[0][1],
      polygon: polygon,
    }).select().single()

    if (landError) { setError(landError.message); setLoading(false); return }

    for (const image of images) {
      const ext = image.name.split('.').pop()
      const path = `${land.id}/${Date.now()}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('land-images')
        .upload(path, image)

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('land-images')
          .getPublicUrl(path)

        await supabase.from('land_media').insert({
          land_id: land.id,
          url: publicUrl,
        })
      }
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">إضافة أرض جديدة</h1>
          <p className="text-gray-500 text-sm mb-6">انقر على الخريطة لرسم حدود الأرض — على الأقل 3 نقاط</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div ref={mapRef} style={{ height: '400px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }} />

          {polygon && (
            <p className="text-green-600 text-sm mb-4">✓ تم رسم الحدود — {polygon.length} نقطة</p>
          )}

          <div className="flex flex-col gap-4">
            <input
              type="text" placeholder="عنوان الإعلان"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-400"
            />
            <textarea
              placeholder="وصف الأرض" rows={3}
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-400 resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number" placeholder="المساحة م²"
                value={form.area_sqm} onChange={e => setForm({...form, area_sqm: e.target.value})}
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-400"
              />
              <input
                type="number" placeholder="السعر"
                value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-400"
              />
            </div>
            <input
              type="text" placeholder="الموقع — مثال: طرطوس، حي الزاهرة"
              value={form.location_text} onChange={e => setForm({...form, location_text: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-400"
            />

            {/* Foto Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصور (حتى 6 صور)
              </label>
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-red-400 transition">
                <div className="text-center">
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-sm text-gray-500">انقر لإضافة صور</div>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={src} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10 }} />
                      <button
                        onClick={() => removeImage(i)}
                        style={{
                          position: 'absolute', top: 4, right: 4,
                          background: 'rgba(0,0,0,0.6)', color: 'white',
                          border: 'none', borderRadius: '50%',
                          width: 22, height: 22, cursor: 'pointer', fontSize: 12
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-2">
              <button
                onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50"
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