import { useEffect, useState } from 'react'
import { AgriculturalVisual } from './AgriculturalVisual.jsx'
import { Icon } from './Ui.jsx'

export function PortalHero({ empresa, campania, hoy }) {
  const date = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Lima'
  }).format(new Date())
  return (
    <section className="portal-hero">
      <AgriculturalVisual />
      <div className="hero-copy">
        <time className="hero-date">{date}</time>
        <h1 className="sr-only">Bienvenido a GesGROW</h1>
        <p className="hero-greeting">Buen día,</p>
        <strong className="hero-company">{empresa}</strong>
        <p className="hero-campaign">
          {campania?.nombre ?? 'Su espacio de gestión agrícola'}
        </p>
        {campania && (
          <div className="hero-facts">
            <span>
              <Icon name="campaign" />{' '}
              {campania.estado === 'ACTIVA'
                ? 'Campaña activa'
                : campania.estado === 'CERRADA'
                  ? 'Campaña cerrada'
                  : 'Campaña seleccionada'}
            </span>
            {hoy?.total_jabas != null && (
              <span>
                Hoy · {new Intl.NumberFormat('es-PE').format(hoy.total_jabas)} jabas
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function weatherTimeOfDay() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Lima'
  }).format(new Date()))
  return hour >= 6 && hour < 16 ? 'day' : hour >= 16 && hour < 19 ? 'afternoon' : 'night'
}

export function WeatherCard() {
  const [timeOfDay, setTimeOfDay] = useState(weatherTimeOfDay)

  useEffect(() => {
    const updateTimeOfDay = () => setTimeOfDay(weatherTimeOfDay())
    const timer = window.setInterval(updateTimeOfDay, 60_000)
    document.addEventListener('visibilitychange', updateTimeOfDay)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', updateTimeOfDay)
    }
  }, [])

  return (
    <section className="weather-card" data-time-of-day={timeOfDay} aria-labelledby="weather-title">
      <div className="weather-symbol">
        <Icon name="weather" />
      </div>
      <span className="eyebrow">En el campo</span>
      <h2 id="weather-title">Clima no configurado</h2>
      <p>La información meteorológica aún no está disponible.</p>
      <span className="weather-footer">Contexto meteorológico</span>
    </section>
  )
}

export function MetricWidget({ label, value, unit, icon }) {
  return (
    <div className="metric-widget">
      <Icon name={icon} />
      <div>
        <dt>{label}</dt>
        <dd>
          {value} <span>{unit}</span>
        </dd>
      </div>
    </div>
  )
}
