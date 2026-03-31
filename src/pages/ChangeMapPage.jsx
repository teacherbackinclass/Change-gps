import React, { useContext, useState, useRef } from 'react';
import { MapPin, MoveRight, Plus, SlidersHorizontal } from 'lucide-react';
import RoleMirrorHeader from '../components/RoleMirrorHeader';
import { AppContext } from '../App';
import { STAGES, clamp01, curveY, formatStage, positionFromDiagnosis, stageFromPosition } from '../lib/changeCurve';

export default function ChangeMapPage() {
  // 1. Safety Check for the Context
  const context = useContext(AppContext) || {};
  const state = context.state || { role: 'PEOPLE_LEADER', activeRoute: '/map' };
  const dispatch = context.dispatch || (() => {});
  const { role } = state;

  // 2. Local Page State
  const [position, setPosition] = useState(0.15);
  const svgRef = useRef(null);

  // 3. Helper to handle clicking the map
  const handleMapClick = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    setPosition(x);
  };

  const currentStage = stageFromPosition(position);

  return (
    <div className="max-w-4xl mx-auto">
      <RoleMirrorHeader 
        role={role} 
        title="Change Navigation Map" 
        subtitle="Locate where you or your team are in the transition."
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Phase: {currentStage?.label || 'Loading...'}</h3>
            <p className="text-sm text-slate-500">Click anywhere on the curve to mark your position</p>
          </div>
          <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
            {role === 'PEOPLE_LEADER' ? 'Leader View' : 'Individual View'}
          </div>
        </div>

        <div className="p-8 bg-slate-50/50">
          <svg 
            ref={svgRef}
            viewBox="0 0 1000 400" 
            className="w-full h-auto cursor-crosshair drop-shadow-sm"
            onClick={handleMapClick}
          >
            {/* The Background Curve Path */}
            <path
              d="M 0 100 Q 250 100 400 300 T 1000 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* The Interactive Dashed Path */}
            <path
              d="M 0 100 Q 250 100 400 300 T 1000 100"
              fill="none"
              stroke="#6366f1"
              strokeWidth="4"
              strokeDasharray="8 8"
            />

            {/* The Indicator Marker */}
            <g transform={`translate(${position * 1000}, ${curveY(position)})`}>
              <circle r="12" fill="#6366f1" className="animate-pulse opacity-20" />
              <circle r="6" fill="#6366f1" stroke="white" strokeWidth="2" />
              <MapPin className="text-indigo-600" x="-12" y="-30" width="24" height="24" />
            </g>
          </svg>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border-t border-slate-100">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" /> What to focus on:
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {role === 'PEOPLE_LEADER' 
                ? "Focus on psychological safety. Validate concerns without over-promising."
                : "Acknowledge your stress. It's okay to not have all the answers right now."}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <MoveRight className="w-4 h-4 text-indigo-500" /> Next Step:
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Check the <strong>Tools</strong> section for a script on how to talk about this phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
