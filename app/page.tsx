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
    const map = L.map(mapRef.current, { zoomControl: false }).setView([34.8862, 35.8836], 13)
    mapInstanceRef.current = map
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    }).addTo(map)
    L.control.zoom({ position: 'bottomleft' }).addTo(map)
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
          width:14px;height:14px;
          background:#f59e0b;
          border-radius:50%;
          border:2.5px solid white;
          box-shadow:0 2px 12px rgba(0,0,0,0.4)
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      const marker = L.marker([land.lat, land.lng], { icon }).addTo(map)
      marker.on('click', () => setSelected(land))
    })
  }, [lands])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
        * { font-family: 'Cairo', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 28px', height: 64,
        background: 'rgba(10,10,10,0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{
          fontWeight: 700, fontSize: 20, color: 'white',
          letterSpacing: '-0.3px'
        }}>
          🗺 أرض ماب
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => router.push('/login')} style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', fontSize: 13, cursor: 'pointer',
            padding: '8px 18px', borderRadius: 10,
            fontFamily: 'Cairo, sans-serif',
          }}>
            تسجيل الدخول
          </button>
          <button onClick={() => router.push('/register')} style={{
            background: '#f59e0b',
            border: 'none',
            color: 'white', fontSize: 13, cursor: 'pointer',
            padding: '8px 20px', borderRadius: 10,
            fontFamily: 'Cairo, sans-serif', fontWeight: 600,
          }}>
            + بيع أرض
          </button>
        </div>
      </nav>

      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: 28, right: 28, zIndex: 1000,
        background: 'rgba(10,10,10,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: 10, padding: '8px 16px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 12, color: 'rgba(255,255,255,0.7)',
      }}>
        {lands.length} أرض معروضة
      </div>

      {/* Land Card */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 18, padding: '24px 28px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1000, width: 360,
          direction: 'rtl',
          animation: 'fadeUp 0.25s ease',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>{selected.title}</h2>
            <button onClick={() => setSelected(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', fontSize: 18, padding: 0,
            }}>✕</button>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
            📍 {selected.location_text}
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '14px 16px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{selected.area_sqm}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>متر مربع</div>
            </div>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '14px 16px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{selected.price?.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>ل.س</div>
            </div>
          </div>

          {selected.description && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
              {selected.description}
            </p>
          )}

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>البائع</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{selected.profiles?.full_name}</div>
            </div>
            <a href={`tel:${selected.profiles?.phone}`} style={{
              background: '#f59e0b', color: 'white',
              borderRadius: 10, padding: '10px 20px',
              fontSize: 13, textDecoration: 'none', fontWeight: 700,
            }}>
              📞 اتصال
            </a>
          </div>
        </div>
      )}
    </div>
  )
}