'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const [lands, setLands] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetchLands()
  }, [])

  const fetchLands = async () => {
    const { data } = await supabase
      .from('lands')
      .select('*, profiles(full_name, phone)')
      .eq('status', 'published')
    setLands(data || [])
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return
    if (!mapRef.current) return

    const L = require('leaflet')

    const map = L.map(mapRef.current).setView([34.8862, 35.8836], 12)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || lands.length === 0) return
    const L = require('leaflet')
    const map = mapInstanceRef.current

    lands.forEach(land => {
      if (!land.lat || !land.lng) return
      const marker = L.marker([land.lat, land.lng]).addTo(map)
      marker.on('click', () => setSelected(land))
    })
  }, [lands])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>

      {/* شريط علوي */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'white', padding: '12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#15803d', fontFamily: 'sans-serif' }}>
          أرض ماب
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              background: '#16a34a', color: 'white',
              border: 'none', borderRadius: 8, padding: '8px 16px',
              cursor: 'pointer', fontFamily: 'sans-serif', fontSize: 14
            }}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => router.push('/register')}
            style={{
              background: 'white', color: '#16a34a',
              border: '1px solid #16a34a', borderRadius: 8, padding: '8px 16px',
              cursor: 'pointer', fontFamily: 'sans-serif', fontSize: 14
            }}
          >
            بيع أرض
          </button>
        </div>
      </div>

      {/* الخريطة */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* بطاقة الأرض المختارة */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 30, left: '50%',
          transform: 'translateX(-50%)',
          background: 'white', borderRadius: 16, padding: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000, minWidth: 320, maxWidth: 400,
          fontFamily: 'sans-serif', direction: 'rtl'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{selected.title}</h2>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}
            >✕</button>
          </div>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 12px' }}>{selected.location_text}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#15803d' }}>{selected.area_sqm} م²</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>المساحة</div>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#15803d' }}>{selected.price?.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>السعر</div>
            </div>
          </div>
          {selected.description && (
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>{selected.description}</p>
          )}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>البائع: {selected.profiles?.full_name}</div>
            <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{selected.profiles?.phone}</div>
          </div>
        </div>
      )}

      {/* عدد الإعلانات */}
      <div style={{
        position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
        background: 'white', borderRadius: 10, padding: '8px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif', fontSize: 13, color: '#374151'
      }}>
        {lands.length} أرض معروضة
      </div>
    </div>
  )
}