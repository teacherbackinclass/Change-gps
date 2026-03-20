import React from 'react';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-indigo-50/50 to-slate-100" />
    </div>
  );
}