import React from 'react';
import { User, Users } from 'lucide-react';

export default function RoleMirrorHeader({ role, title, subtitle }) {
  const isLeader = role === 'PEOPLE_LEADER';
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
        {isLeader ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
        <span>View as: {isLeader ? 'People Leader' : 'Individual'}</span>
      </div>
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}