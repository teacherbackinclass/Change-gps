import React, { useReducer, createContext, useContext } from 'react';
import { MapPin, Wind, Wrench, User, Users } from 'lucide-react';
import ChangeMapPage from './pages/ChangeMapPage';
import ToolsPage from './pages/ToolsPage';
import RegulatePage from './pages/RegulatePage';

// 1. Create the Context (The "Shared Brain")
export const AppContext = createContext();

// 2. The Initial Settings
const initialState = {
  role: 'PEOPLE_LEADER', // This is what the error is missing!
  activeRoute: '/map',
  savedPlan: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE': return { ...state, role: action.payload };
    case 'NAVIGATE': return { ...state, activeRoute: action.payload };
    default: return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Decides which page to show
  const renderPage = () => {
    switch (state.activeRoute) {
      case '/map': return <ChangeMapPage />;
      case '/tools': return <ToolsPage />;
      case '/regulate': return <RegulatePage />;
      default: return <ChangeMapPage />;
    }
  };

  return (
    /* This Provider tag "gives" the role to all the pages inside it */
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-r border-slate-200 p-4 space-y-4">
          <div className="font-black text-xl tracking-tight text-indigo-600">CHANGE GPS</div>
          
          <nav className="space-y-1">
            <NavBtn id="/map" icon={MapPin} label="Change Map" active={state.activeRoute === '/map'} dispatch={dispatch} />
            <NavBtn id="/tools" icon={Wrench} label="Tools" active={state.activeRoute === '/tools'} dispatch={dispatch} />
            <NavBtn id="/regulate" icon={Wind} label="Regulate" active={state.activeRoute === '/regulate'} dispatch={dispatch} />
          </nav>

          {/* Role Toggle */}
          <div className="pt-4 border-t border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Viewing As</p>
             <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => dispatch({ type: 'SET_ROLE', payload: 'INDIVIDUAL' })}
                  className={`flex-1 py-1 text-xs rounded ${state.role === 'INDIVIDUAL' ? 'bg-white shadow' : ''}`}
                >Individual</button>
                <button 
                  onClick={() => dispatch({ type: 'SET_ROLE', payload: 'PEOPLE_LEADER' })}
                  className={`flex-1 py-1 text-xs rounded ${state.role === 'PEOPLE_LEADER' ? 'bg-white shadow' : ''}`}
                >Leader</button>
             </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
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
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}
