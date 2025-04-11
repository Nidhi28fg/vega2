
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import SearchPage from './components/SearchPage';
import ImageEditor from './components/ImageEditor';


function App() {
  return (
    <div className="App">
     
      <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/edit" element={<ImageEditor />} />

      </Routes>
    </Router>
    </div>
  );
}

export default App;
