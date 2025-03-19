// src/components/events/CalendarView.tsx
'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

type Event = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

type CalendarValue = Date | Date[] | null;

type CalendarViewProps = {
  events: Event[];
};

export default function CalendarView({ events }: CalendarViewProps) {
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // 日付に対応するイベントを取得
  const getEventsForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventDate = format(eventStart, 'yyyy-MM-dd');
      return eventDate === formattedDate;
    });
  };

  // 日付タイルの内容をカスタマイズ
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const eventsForDay = getEventsForDate(date);

    if (eventsForDay.length === 0) return null;

    return (
      <div className="text-xs mt-1 text-blue-500 font-semibold">
        {eventsForDay.length}件
      </div>
    );
  };

// 日付がクリックされたときの処理
  const handleDateClick = (value: CalendarValue) => {
    if (value instanceof Date) {
      setDate(value);
      setSelectedEvent(null);
    }
  };

  // 選択された日付のイベントリスト
  const selectedDateEvents = getEventsForDate(date);

  // イベント詳細表示のフォーマット
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'yyyy年MM月dd日 HH:mm');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">イベントカレンダー</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* カレンダー */}
        <div>
          <Calendar
            onChange={handleDateClick as any}
            value={date}
            tileContent={tileContent}
            className="border rounded shadow p-4 w -full"
          />
        </div>

        {/* 選択した日のイベント一覧 */}
        <div className="border rounded shadow p-4">
          <h3 className="text-xl font-semibold mb-4">
            {format(date, 'yyyy年MM月dd日')}のイベント
          </h3>

          {selectedDateEvents.length === 0 ? (
            <p className="text-gray-500">この日のイベントはありません</p>
          ) : (
            <div className="space-y-4">
              {selectedDateEvents.map(event => (
                <div
                  key={event.id}
                  className="border-l-4 border-blue-500 pl-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* イベント詳細 */}
          {selectedEvent && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h4 className="text-lg font-semibold">{selectedEvent.title}</h4>
              <div className="mt-2 text-sm">
                <p><span className="font-medium">開始:</span> {formatDateTime(selectedEvent.startTime)}</p>
                <p><span className="font-medium">終了:</span> {formatDateTime(selectedEvent.endTime)}</p>

                {selectedEvent.description && (
                  <div className="mt-2">
                    <p className="font-medium">説明:</p>
                    <p className="whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}