import './App.css';
import Reservas from './Components/Hab/Reservas';
import Bar from './Components/Bar/Bar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App bg-secondary bg-opacity-25">
      
      <BrowserRouter>
        <Routes>
          <Route path='/:num' element={<Reservas></Reservas>}>
            
          </Route>
          <Route path='/bar' element={<Bar></Bar>}>
            
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
