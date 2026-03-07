import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import availabilityService from '../services/availabilityService'

const DAYS = [
  { key: '1', label: 'Seg', full: 'Segunda' },
  { key: '2', label: 'Ter', full: 'Terça' },
  { key: '3', label: 'Qua', full: 'Quarta' },
  { key: '4', label: 'Qui', full: 'Quinta' },
  { key: '5', label: 'Sex', full: 'Sexta' },
  { key: '6', label: 'Sáb', full: 'Sábado' },
  { key: '0', label: 'Dom', full: 'Domingo' },
]

const HOURS = []
for (let h = 0; h < 24; h++) {
  HOURS.push(`${String(h).padStart(2, '0')}:00`)
}

const TIME_PERIODS = [
  { label: 'Madrugada', range: [0, 5], color: 'text-indigo-400' },
  { label: 'Manhã', range: [6, 11], color: 'text-amber-500' },
  { label: 'Tarde', range: [12, 17], color: 'text-orange-500' },
  { label: 'Noite', range: [18, 23], color: 'text-indigo-600' },
]

export default function AvailabilityGrid() {
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null) // 'select' or 'deselect'

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      const data = await availabilityService.getMyAvailability()

      const grid = {}
      if (data.slots) {
        data.slots.forEach((slot) => {
          const day = String(slot.day_of_week)
          if (!grid[day]) grid[day] = {}
          HOURS.forEach((hour) => {
            const hourEnd = `${String(parseInt(hour) + 1).padStart(2, '0')}:00`
            if (hour >= slot.start_time && hourEnd <= slot.end_time) {
              grid[day][hour] = true
            }
          })
        })
      }
      setSelected(grid)
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSlot = (day, hour) => {
    setSelected((prev) => {
      const updated = { ...prev }
      if (!updated[day]) updated[day] = {}
      updated[day] = { ...updated[day] }

      if (updated[day][hour]) {
        delete updated[day][hour]
        if (Object.keys(updated[day]).length === 0) delete updated[day]
      } else {
        updated[day][hour] = true
      }
      return updated
    })
    setSuccess(false)
  }

  const setSlot = (day, hour, value) => {
    setSelected((prev) => {
      const updated = { ...prev }
      if (!updated[day]) updated[day] = {}
      updated[day] = { ...updated[day] }

      if (value) {
        updated[day][hour] = true
      } else {
        delete updated[day][hour]
        if (Object.keys(updated[day]).length === 0) delete updated[day]
      }
      return updated
    })
    setSuccess(false)
  }

  const handleMouseDown = (day, hour) => {
    const isSelected = selected[day]?.[hour]
    setIsDragging(true)
    setDragMode(isSelected ? 'deselect' : 'select')
    setSlot(day, hour, !isSelected)
  }

  const handleMouseEnter = (day, hour) => {
    if (!isDragging) return
    setSlot(day, hour, dragMode === 'select')
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragMode(null)
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const toggleDay = (dayKey) => {
    const dayHours = selected[dayKey] || {}
    const allSelected = HOURS.every(h => dayHours[h])

    setSelected(prev => {
      const updated = { ...prev }
      if (allSelected) {
        delete updated[dayKey]
      } else {
        updated[dayKey] = {}
        HOURS.forEach(h => { updated[dayKey][h] = true })
      }
      return updated
    })
    setSuccess(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      const weeklyTemplate = {}

      Object.entries(selected).forEach(([day, hours]) => {
        const sortedHours = Object.keys(hours).sort()
        if (sortedHours.length === 0) return

        const ranges = []
        let rangeStart = sortedHours[0]
        let rangeEnd = `${String(parseInt(sortedHours[0]) + 1).padStart(2, '0')}:00`

        for (let i = 1; i < sortedHours.length; i++) {
          const expectedNext = `${String(parseInt(sortedHours[i - 1]) + 1).padStart(2, '0')}:00`
          if (sortedHours[i] === expectedNext) {
            rangeEnd = `${String(parseInt(sortedHours[i]) + 1).padStart(2, '0')}:00`
          } else {
            ranges.push({ start_time: rangeStart, end_time: rangeEnd })
            rangeStart = sortedHours[i]
            rangeEnd = `${String(parseInt(sortedHours[i]) + 1).padStart(2, '0')}:00`
          }
        }
        ranges.push({ start_time: rangeStart, end_time: rangeEnd })

        weeklyTemplate[day] = ranges
      })

      await availabilityService.updateAvailability(weeklyTemplate)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const msg = err.errors?.[0] || 'Erro ao salvar disponibilidade. Tente novamente.'
      setError(msg)
      setTimeout(() => setError(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const countDayHours = (dayKey) => {
    return Object.keys(selected[dayKey] || {}).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="select-none">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full border-separate border-spacing-[3px]" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th className="w-14"></th>
              {DAYS.map(({ key, label, full }) => {
                const count = countDayHours(key)
                return (
                  <th key={key} className="text-center pb-1">
                    <button
                      type="button"
                      onClick={() => toggleDay(key)}
                      className="group flex flex-col items-center w-full"
                      title={`${full} — clique para selecionar/limpar tudo`}
                    >
                      <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                        {label}
                      </span>
                      {count > 0 && (
                        <span className="text-[9px] text-gray-400">{count}h</span>
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_PERIODS.map((period) => (
              HOURS.slice(period.range[0], period.range[1] + 1).map((hour, idx) => {
                const h = parseInt(hour)
                return (
                  <tr key={hour}>
                    <td className="pr-1.5 text-right align-middle">
                      {idx === 0 ? (
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${period.color}`}>
                          {period.label}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 tabular-nums">
                          {h}h
                        </span>
                      )}
                    </td>
                    {DAYS.map(({ key }) => {
                      const isSelected = selected[key]?.[hour]
                      return (
                        <td key={`${key}-${hour}`} className="p-0">
                          <button
                            type="button"
                            onMouseDown={() => handleMouseDown(key, hour)}
                            onMouseEnter={() => handleMouseEnter(key, hour)}
                            className={`w-full h-5 rounded-sm transition-colors ${
                              isSelected
                                ? 'bg-indigo-500 hover:bg-indigo-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            title={`${DAYS.find(d => d.key === key)?.full} ${hour}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Disponível
          <span className="w-3 h-3 rounded-sm bg-gray-100 inline-block ml-2" /> Indisponível
        </div>
        <p className="text-[10px] text-gray-400 ml-auto">Arraste para selecionar múltiplos horários</p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-4"
        size="sm"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Salvo!
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar Disponibilidade
          </>
        )}
      </Button>
    </div>
  )
}
