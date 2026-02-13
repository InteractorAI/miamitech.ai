import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CapitalFocused } from './pages/CapitalFocused';
import { InteractorWidget } from './components/InteractorWidget';

function App() {
  return (
    <Router>
      <div className="bg-miami-black min-h-screen text-gray-300 font-mono selection:bg-miami-pink selection:text-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/capital" element={<CapitalFocused />} />
        </Routes>
        <InteractorWidget />
      </div>
    </Router>
  );
}

export default App;
