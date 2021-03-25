import React from 'react';
import './App.css';
import {GopherTab} from './components/GopherTab';

function App() {  
  document.addEventListener('contextmenu', (e:Event)  => {e.preventDefault();});
  return (
    <GopherTab></GopherTab>
  );
}

export default App;
