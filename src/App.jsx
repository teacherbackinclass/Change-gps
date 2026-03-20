import React, { useReducer, createContext, useContext } from 'react';
import { MapPin, Wind, Wrench, Clipboard, User, Users } from 'lucide-react';
import ChangeMapPage from './pages/ChangeMapPage';
import ToolsPage from './pages/ToolsPage';
import RegulatePage from './pages/RegulatePage';

// 1. Setup the "Brain" (State)
const initialState = {
  role: 'PEOPLE_LEADER',
  activeRoute: '/map',
  savedPlan: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE': return { ...state, role: action.payload };
    case 'NAVIGATE': return { ...state, activeRoute: action.payload };
    case 'ADD_TO_PLAN': return { ...state, savedPlan: [...state.savedPlan, action.payload] };
    default: return state;
  }
}

export const AppContext = createContext();

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 2. Simple Router (decides which page to show)
  const renderPage = () => {
    switch (state.activeRoute) {
      case '/map': return <ChangeMapPage />;
      case '/tools': return <ToolsPage />;
      case '/regulate': return <RegulatePage />;
      default: return <ChangeMapPage />;
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-r border-slate-200 p-4 space-y-4">
          <div className="font-black text-xl tracking-tight text-indigo-600">CHANGE GPS</div>
          
          <nav className="space-y-1">
            <NavBtn id="/map" icon={MapPin} label="Change Map" active={state.activeRoute === '/map'} dispatch={dispatch} />
            <NavBtn id="/tools" icon={Wrench} label="Tools & Scripts" active={state.activeRoute === '/tools'} dispatch={dispatch} />
            <NavBtn id="/regulate" icon={Wind} label="Regulate" active={state.activeRoute === '/regulate'} dispatch={dispatch} />
          </nav>

          <div className="pt-4 border-t border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Viewing As</p>
             <div className="flex bg-slate-100 rounded-lg p-1">
                <RoleBtn role="INDIVIDUAL" current={state.role} dispatch={dispatch} label="Individual" />
                <RoleBtn role="PEOPLE_LEADER" current={state.role} dispatch={dispatch} label="Leader" />
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
          {renderPage()}
        </main>
      </div>
    </AppContext.Provider>
  );
}

function NavBtn({ id, icon: Icon, label, active, dispatch }) {
  return (
    <button 
      onClick={() => dispatch({ type: 'NAVIGATE', payload: id })}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <Icon className="w-5 h-5" /> {label}
    </button>
  );
}

function RoleBtn({ role, current, dispatch, label }) {
  const active = current === role;
  return (
    <button 
      onClick={() => dispatch({ type: 'SET_ROLE', payload: role })}
      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
    >
      {label}
    </button>
  );
}