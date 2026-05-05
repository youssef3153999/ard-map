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

  useEffect(() => { fetchLands() }, [])

  const fetchLands = async () => {
    const { data } = await supabase
      .from('lands')
      .select('*, profiles(full_name, phone)')
      .eq('status', 'published')
    setLands(data || [])
  }

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current || !mapRef.current) return
    const L = require('leaflet')
    const map = L.map(mapRef.current, { zoomControl: false }).setView([34.8862, 35.8836], 12)
    mapInstanceRef.current = map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO'
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || lands.length === 0) return
    const L = require('leaflet')
    const map = mapInstanceRef.current
    lands.forEach(land => {
      if (!land.lat || !land.lng) return
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:12px;height:12px;
          background:#1a1a1a;
          border-radius:50%;
          border:2px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3)
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })
      const marker = L.marker([land.lat, land.lng], { icon }).addTo(map)
      marker.on('click', () => setSelected(land))
    })
  }, [lands])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: 60,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          أرض ماب
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => router.push('/login')} style={{
            background: 'none', border: 'none',
            color: '#1a1a1a', fontSize: 13, cursor: 'pointer',
            padding: '8px 16px', borderRadius: 8,
            fontFamily: 'inherit',
          }}>
            دخول
          </button>
          <button onClick={() => router.push('/register')} style={{
            background: '#1a1a1a', border: 'none',
            color: 'white', fontSize: 13, cursor: 'pointer',
            padding: '8px 18px', borderRadius: 8,
            fontFamily: 'inherit', fontWeight: 500,
          }}>
            بيع أرض
          </button>
        </div>
      </nav>

      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: 32, left: 32, zIndex: 1000,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: 10, padding: '8px 16px',
        border: '1px solid rgba(0,0,0,0.06)',
        fontSize: 12, color: '#6b7280',
        letterSpacing: '0.02em',
      }}>
        {lands.length} أرض معروضة
      </div>

      {/* Land Card */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: 16, padding: '24px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          zIndex: 1000, width: 360,
          direction: 'rtl',
          animation: 'fadeUp 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{selected.title}</h2>
            <button onClick={() => setSelected(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', fontSize: 16, padding: 0, lineHeight: 1,
            }}>✕</button>
          </div>

          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px', letterSpacing: '0.02em' }}>
            {selected.location_text}
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{
              flex: 1, background: '#f9f9f9', borderRadius: 10,
              padding: '12px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{selected.area_sqm}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>م²</div>
            </div>
            <div style={{
              flex: 1, background: '#f9f9f9', borderRadius: 10,
              padding: '12px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{selected.price?.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>ل.س</div>
            </div>
          </div>

          {selected.description && (
            <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 20 }}>
              {selected.description}
            </p>
          )}

          <div style={{
            borderTop: '1px solid #f3f4f6', paddingTop: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>البائع</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{selected.profiles?.full_name}</div>
            </div>
            <a href={`tel:${selected.profiles?.phone}`} style={{
              background: '#1a1a1a', color: 'white',
              borderRadius: 8, padding: '8px 16px',
              fontSize: 13, textDecoration: 'none', fontWeight: 500,
            }}>
              اتصال
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}