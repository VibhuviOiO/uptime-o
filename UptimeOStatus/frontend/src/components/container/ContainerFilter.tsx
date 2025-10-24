import React from 'react';

export function ContainerFilter({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search containers..."
      className="w-full sm:w-96 px-4 py-2 rounded-xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-900 shadow focus:shadow-lg transition"
      style={{ height: 40, fontSize: '1rem' }}
    />
  );
}