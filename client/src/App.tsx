import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import Game from './components/Game';
import Lobby from './components/Lobby';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby/:gameId" element={<Lobby />} />
          <Route path="/game/:gameId" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 