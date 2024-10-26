'use client'

import { useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, isAfter, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X, Save } from 'lucide-react'

import { Button } from "src/s/components/ui/button"
import { Card, CardContent } from "src/s/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/s/components/ui/select"
import { Input } from "src/s/components/ui/input"
import { cn } from "src/s/lib/utils"

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Event {
  id: number
  title: string
  date: Date
  color: string
}

export default function AdvancedEditableCalendar() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [events, setEvents] = useState<Event[]>([])
  const [editingEvent, setEditingEvent] = useState<number | null>(null)
  const [newEventDate, setNewEventDate] = useState<Date | null>(null)
  const [newEventTitle, setNewEventTitle] = useState('')

  const changeMonth = (increment: number) => {
    setCurrentDate(prevDate => addMonths(prevDate, increment))
  }

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date))
    const end = endOfWeek(endOfMonth(date))
    return eachDayOfInterval({ start, end })
  }

  const days = getDaysInMonth(currentDate)

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(event.date, date)
    )
  }

  const handleEventEdit = (id: number, newTitle: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id ? { ...event, title: newTitle } : event
      )
    )
    setEditingEvent(null)
  }

  const handleEventDelete = (id: number) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id))
  }

  const handleAddEvent = (date: Date) => {
    if (isAfter(date, new Date()) || isSameDay(date, new Date())) {
      setNewEventDate(date)
      setNewEventTitle('')
    }
  }

  const createNewEvent = () => {
    if (newEventDate && newEventTitle.trim()) {
      const newEvent: Event = {
        id: Date.now(),
        title: newEventTitle.trim(),
        date: newEventDate,
        color: `bg-${['blue', 'red', 'green', 'purple', 'yellow', 'pink'][Math.floor(Math.random() * 6)]}-100 text-${['blue', 'red', 'green', 'purple', 'yellow', 'pink'][Math.floor(Math.random() * 6)]}-800`
      }
      setEvents(prevEvents => [...prevEvents, newEvent])
      setNewEventDate(null)
      setNewEventTitle('')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 border-r">
        <Button className="w-full mb-4" onClick={() => handleAddEvent(new Date())}>
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
        <nav className="space-y-2">
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Month</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Week</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Day</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
          </div>
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </header>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 p-px">
          {DAYS.map(day => (
            <div key={day} className="bg-white p-2 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <Card key={index} className={cn(
              "h-32 overflow-hidden",
              !isSameMonth(day, currentDate) && "bg-gray-50 opacity-50",
              isSameDay(day, today) && "ring-2 ring-blue-500"
            )}>
              <CardContent className="p-2">
                <div className="text-right text-sm text-gray-500">{format(day, 'd')}</div>
                <div className="mt-1 space-y-1">
                  {getEventsForDate(day).map(event => (
                    <div 
                      key={event.id} 
                      className={cn("text-xs rounded px-1 py-0.5 flex items-center justify-between", event.color)}
                    >
                      {editingEvent === event.id ? (
                        <Input
                          type="text"
                          defaultValue={event.title}
                          onBlur={(e) => handleEventEdit(event.id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEventEdit(event.id, e.currentTarget.value)
                            }
                          }}
                          className="w-full text-xs p-0 h-auto"
                          autoFocus
                        />
                      ) : (
                        <>
                          <span onClick={() => setEditingEvent(event.id)}>{event.title}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-red-200"
                            onClick={() => handleEventDelete(event.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                  {newEventDate && isSameDay(day, newEventDate) && (
                    <div className="flex items-center space-x-1">
                      <Input
                        type="text"
                        placeholder="New event"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full text-xs p-0 h-6"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={createNewEvent}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {(isAfter(day, new Date()) || isSameDay(day, new Date())) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1 h-4 text-xs"
                    onClick={() => handleAddEvent(day)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}