import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import availabilityService from '../services/availabilityService'

const DAYS = [
  { key: '1', label: 'Seg' },
  { key: '2', label: 'Ter' },
  { key: '3', label: 'Qua' },
  { key: '4', label: 'Qui' },
  { key: '5', label: 'Sex' },
  { key: '6', label: 'Sáb' },
  { key: '0', label: 'Dom' },
]

const HOURS = []
for (let h = 8; h <= 18; h++) {
  HOURS.push(`${String(h).padStart(2, '0')}:00`)
}

export default function AvailabilityGrid() {
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      const data = await availabilityService.getMyAvailability()

      // Build grid state from existing slots
      const grid = {}
      if (data.slots) {
        data.slots.forEach((slot) => {
          const day = String(slot.day_of_week)
          if (!grid[day]) grid[day] = {}
          // Mark each hour that falls within this slot's range
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

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      // Convert grid to weekly template: group consecutive hours into ranges
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1 text-left text-gray-500 font-normal w-10"></th>
              {HOURS.map((hour) => (
                <th key={hour} className="p-1 text-center text-gray-500 font-normal min-w-[32px]">
                  {hour.split(':')[0]}h
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(({ key, label }) => (
              <tr key={key}>
                <td className="p-1 text-gray-600 font-medium">{label}</td>
                {HOURS.map((hour) => {
                  const isSelected = selected[key]?.[hour]
                  return (
                    <td key={`${key}-${hour}`} className="p-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSlot(key, hour)}
                        className={`w-full h-6 rounded transition-colors ${
                          isSelected
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        title={`${label} ${hour}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Disponível
          <span className="w-3 h-3 rounded bg-gray-100 inline-block ml-2" /> Indisponível
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-3"
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
