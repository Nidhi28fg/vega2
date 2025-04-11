
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import SearchPage from './components/SearchPage';
import AddEditor from './components/AddEditor';


function App() {
  return (
    <div className="App">
     
      <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/edit" element={<AddEditor />} />

      </Routes>
    </Router>
    </div>
  );
}

export default App;
