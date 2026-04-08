import React, { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, 
  eachDayOfInterval, isWithinInterval, isBefore, parseISO 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Palette, Trash2 } from 'lucide-react';




const THEMES = [
  {
    id: 'blue', name: 'Glacier', image: '/images/glacier.jpg',
    primary: 'bg-blue-600', light: 'bg-blue-100', veryLight: 'bg-blue-50', hoverLight: 'hover:bg-blue-50',
    textDark: 'text-blue-800', dotColor: 'bg-blue-500', underline: 'decoration-blue-400'
  },
  {
    id: 'emerald', name: 'Forest', image: '/images/forest.avif',
    primary: 'bg-emerald-600', light: 'bg-emerald-100', veryLight: 'bg-emerald-50', hoverLight: 'hover:bg-emerald-50',
    textDark: 'text-emerald-800', dotColor: 'bg-emerald-500', underline: 'decoration-emerald-400'
  },
  {
    id: 'rose', name: 'Canyon', image: '/images/canyon.avif',
    primary: 'bg-rose-600', light: 'bg-rose-100', veryLight: 'bg-rose-50', hoverLight: 'hover:bg-rose-50',
    textDark: 'text-rose-800', dotColor: 'bg-rose-500', underline: 'decoration-rose-400'
  }
];


const InteractiveCalendar = () => {
  // --- STATE & SYNCHRONOUS LOCAL STORAGE LOADING ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  

  // Lazy initialize state directly from localStorage so it never starts empty
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem('cal_startDate');
    return saved ? new Date(saved) : null;
  });


  const [endDate, setEndDate] = useState(() => {
    const saved = localStorage.getItem('cal_endDate');
    return saved ? new Date(saved) : null;
  });


  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('cal_theme');
    return THEMES.find(t => t.id === saved) || THEMES[0];
  });


  const [notesData, setNotesData] = useState(() => {
    const saved = localStorage.getItem('cal_notesData');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });


  const [hoverDate, setHoverDate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAnchor, setDragAnchor] = useState(null);



  // --- LOCAL STORAGE PERSISTENCE  ---
  useEffect(() => {
    if (!isDragging) {
      if (startDate) localStorage.setItem('cal_startDate', startDate.toISOString());
      else localStorage.removeItem('cal_startDate');
      
      if (endDate) localStorage.setItem('cal_endDate', endDate.toISOString());
      else localStorage.removeItem('cal_endDate');
      
      localStorage.setItem('cal_theme', activeTheme.id);
      localStorage.setItem('cal_notesData', JSON.stringify(notesData));
    }
  }, [startDate, endDate, activeTheme, notesData, isDragging]);



  // --- CALENDAR MATH ---
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDateOfWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDateOfWeek = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDateOfWeek, end: endDateOfWeek });



  // --- SMART NOTES LOGIC ---
  const getActiveKey = () => {
    if (startDate && endDate) return `range_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
    if (startDate) return `date_${format(startDate, 'yyyy-MM-dd')}`;
    return `month_${format(currentMonth, 'yyyy-MM')}`;
  };


  const handleNoteChange = (e) => {
    const key = getActiveKey();
    setNotesData(prev => ({ ...prev, [key]: e.target.value }));
  };


  const handleDeleteNote = (keyToDelete) => {
    setNotesData(prev => {
      const newData = { ...prev };
      delete newData[keyToDelete];
      return newData;
    });
  };


  const currentMonthPrefix = format(currentMonth, 'yyyy-MM');
  const activeKey = getActiveKey();
  

  const monthNotes = Object.entries(notesData).filter(([key, text]) => {
    if (!text.trim()) return false;
    return key.includes(currentMonthPrefix); 
  });




  const formatLabel = (key) => {
    if (key.startsWith('month_')) return 'General Month Note';
    if (key.startsWith('date_')) {
      const dateStr = key.replace('date_', '');
      return format(parseISO(dateStr), 'MMM d');
    }
    if (key.startsWith('range_')) {
      const [startStr, endStr] = key.replace('range_', '').split('_');
      return `${format(parseISO(startStr), 'MMM d')} - ${format(parseISO(endStr), 'MMM d')}`;
    }
    return 'Note';
  };



  // --- DRAG AND DROP LOGIC ---
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) { setIsDragging(false); setDragAnchor(null); }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);


  const handleMouseDown = (day) => {
    setIsDragging(true); setDragAnchor(day);
    if (startDate && endDate) { setStartDate(day); setEndDate(null); } 
    else if (!startDate) { setStartDate(day); }
  };


  const handleMouseEnter = (day) => {
    if (isDragging && dragAnchor) {
      if (isBefore(day, dragAnchor)) { setStartDate(day); setEndDate(dragAnchor); } 
      else { setStartDate(dragAnchor); setEndDate(day); }
    } else {
      setHoverDate(day);
    }
  };


  const handleMouseUp = (day) => {
    setIsDragging(false);
    if (dragAnchor && isSameDay(dragAnchor, day) && startDate && !endDate && !isSameDay(startDate, day)) {
      if (isBefore(day, startDate)) { setEndDate(startDate); setStartDate(day); } 
      else { setEndDate(day); }
    }
    setDragAnchor(null);
  };



  const getDayClasses = (day) => {
    let classes = "aspect-square flex items-center justify-center text-sm rounded-full transition-all duration-200 cursor-pointer select-none ";
    if (!isSameMonth(day, monthStart)) return classes + "text-gray-300 pointer-events-none ";

    const isStart = startDate && isSameDay(day, startDate);
    const isEnd = endDate && isSameDay(day, endDate);
    const isBetween = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
    const isHoverBetween = startDate && !endDate && hoverDate && isWithinInterval(day, { start: startDate, end: hoverDate }) && !isBefore(hoverDate, startDate);
    
    const dayKey = `date_${format(day, 'yyyy-MM-dd')}`;
    const hasNote = notesData[dayKey] && notesData[dayKey].trim() !== "";

    if (isStart || isEnd) {
      classes += `${activeTheme.primary} text-white font-bold shadow-md transform scale-105 z-10 relative `;
    } else if (isBetween || isHoverBetween) {
      classes += `${activeTheme.light} ${activeTheme.textDark} rounded-none `;
    } else {
      classes += `text-gray-700 ${activeTheme.hoverLight} `;
      if (hasNote) classes += `underline decoration-2 underline-offset-4 ${activeTheme.underline} `;
    }

    return classes;
  };









  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 transition-all duration-500">
      
      {/* LEFT SIDE: Hero Image & Header */}
      <div className="w-full md:w-2/5 flex flex-col bg-gray-100 flex-shrink-0 overflow-hidden group relative">
        <div className="relative flex-grow min-h-[160px] md:min-h-[220px]">
          <img 
            src={activeTheme.image} 
            alt="Calendar Theme" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none"
          />
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <Palette size={14} className="text-gray-600" />
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                className={`w-4 h-4 rounded-full ${theme.dotColor} border-2 ${activeTheme.id === theme.id ? 'border-gray-800 scale-125' : 'border-transparent'} transition-transform`}
                title={theme.name}
              />
            ))}
          </div>
        </div>
        
        <div className={`p-6 ${activeTheme.primary} text-white transition-colors duration-500 z-10`}>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-bold tracking-wider uppercase select-none">{format(currentMonth, 'MMMM')}</h2>
              <p className="text-xl font-light opacity-90 select-none">{format(currentMonth, 'yyyy')}</p>
            </div>
            <div className="flex gap-2 mb-1 z-20 relative">
              <button onClick={prevMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft size={24} /></button>
              <button onClick={nextMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronRight size={24} /></button>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-4 bg-black/20 flex justify-around px-4 pt-1 z-20">
           {[...Array(15)].map((_, i) => (<div key={i} className="w-2 h-4 rounded-full bg-gray-800 shadow-sm border border-gray-600"></div>))}
        </div>
      </div>

      {/* RIGHT SIDE: Notes & Grid */}
      <div className="w-full p-6 md:p-8 lg:p-12 flex flex-col lg:flex-row gap-8">
        
        {/* SMART NOTES SECTION */}
        <div className="w-full lg:w-1/3 flex flex-col max-h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-widest select-none ${activeTheme.textDark} opacity-60`}>Smart Planner</h3>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(null); setEndDate(null); }}
                className={`text-[10px] ${activeTheme.textDark} opacity-60 hover:opacity-100 transition-all underline`}
              >
                Clear Selection
              </button>
            )}
          </div>
          
          <div className={`p-4 rounded-xl mb-4 transition-colors duration-500 border border-transparent shadow-sm ${startDate || endDate ? activeTheme.light : activeTheme.veryLight}`}>
             <div className="flex justify-between items-start mb-2">
               <p className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.textDark}`}>
                 {startDate && endDate ? `Note: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}` :
                  startDate ? `Note: ${format(startDate, 'MMMM d')}` :
                  `General Notes for ${format(currentMonth, 'MMMM')}`}
               </p>
               {notesData[activeKey] && notesData[activeKey].trim() !== '' && (
                 <button onClick={() => handleDeleteNote(activeKey)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete current note">
                   <Trash2 size={13} />
                 </button>
               )}
             </div>
             
             <textarea
                value={notesData[activeKey] || ''}
                onChange={handleNoteChange}
                placeholder="Type your note here..."
                className="w-full bg-transparent resize-none text-sm outline-none text-gray-800 focus:ring-0 leading-relaxed custom-scrollbar"
                rows={3}
             />
          </div>

          {/* Read-Only Summary List */}
          <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             {monthNotes
               .filter(([key]) => key !== activeKey) 
               .map(([key, text]) => (
                <div key={key} className={`p-3 border border-gray-100 rounded-xl bg-white ${activeTheme.hoverLight} transition-colors group relative`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-[10px] font-bold uppercase ${activeTheme.textDark} opacity-80`}>
                      {formatLabel(key)}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(key); }}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{text}</p>
                </div>
             ))}
             
             {monthNotes.length === 0 && (!notesData[activeKey] || notesData[activeKey].trim() === '') && (
               <p className="text-xs text-gray-400 text-center mt-6 italic">
                 No notes for {format(currentMonth, 'MMMM')} yet.
               </p>
             )}
          </div>
        </div>

        {/* Dynamic Calendar Grid */}
        <div className="w-full lg:w-2/3" onMouseLeave={() => setHoverDate(null)}>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <div key={day} className={`text-[10px] font-bold uppercase mb-2 select-none ${activeTheme.textDark} opacity-60 transition-colors`}>
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, idx) => (
              <div key={idx} className="flex justify-center">
                <button 
                  onMouseDown={() => handleMouseDown(day)}
                  onMouseEnter={() => handleMouseEnter(day)}
                  onMouseUp={() => handleMouseUp(day)}
                  className={getDayClasses(day)}
                >
                  {format(day, 'd')}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InteractiveCalendar;