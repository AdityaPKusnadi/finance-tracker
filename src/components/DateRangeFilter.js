'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import "react-datepicker/dist/react-datepicker.css";

const DateRangeFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'last3Months', label: '3 Months' },
    { id: 'custom', label: 'Custom' },
  ];

  const applyFilter = (filterId) => {
    setActiveFilter(filterId);
    let start = null;
    let end = null;

    const today = new Date();

    switch (filterId) {
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case 'last3Months':
        start = startOfMonth(subMonths(today, 2));
        end = endOfMonth(today);
        break;
      case 'custom':
        // Keep custom dates if set, or default to current month
        if (!startDate && !endDate) {
          start = startOfMonth(today);
          end = endOfMonth(today);
        } else {
          start = startDate ? startOfDay(startDate) : null;
          end = endDate ? endOfDay(endDate) : null;
        }
        setIsOpen(true);
        break;
      default:
        // 'all' case - no date filtering
        start = null;
        end = null;
    }

    setStartDate(start);
    setEndDate(end);
    onFilterChange(start, end);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    if (start && end) {
      onFilterChange(startOfDay(start), endOfDay(end));
    }
  };

  const clearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setActiveFilter('all');
    onFilterChange(null, null);
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Filter Transactions</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => applyFilter(option.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              activeFilter === option.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            {option.label}
          </button>
        ))}

        {(startDate || endDate) && (
          <button
            onClick={clearFilter}
            className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center gap-1"
          >
            <XMarkIcon className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      
      {activeFilter === 'custom' && (
        <div className="relative">
          <div
            className="flex items-center gap-2 p-2 border border-border rounded-md bg-background cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">
              {startDate && endDate
                ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                : 'Select date range'}
            </span>
          </div>
          
          {isOpen && (
            <div className="absolute z-10 mt-1 bg-card border border-border rounded-md shadow-lg p-2">
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                maxDate={new Date()}
              />
            </div>
          )}
        </div>
      )}

      {(startDate || endDate) && activeFilter !== 'custom' && (
        <div className="text-xs text-muted-foreground mt-1">
          Showing transactions from {startDate ? format(startDate, 'MMM d, yyyy') : 'the beginning'} to {endDate ? format(endDate, 'MMM d, yyyy') : 'now'}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
