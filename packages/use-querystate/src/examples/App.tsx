import React, { useEffect } from 'react';
import './App.css';

const addBodyClass = (className: string) => document.body.classList.add(className);
const removeBodyClass = (className: string) => document.body.classList.remove(className);

function App() {
  const [theme, setTheme] = React.useState('dark');

  useEffect(() => {
    addBodyClass(theme);
    return () => removeBodyClass(theme);
  }, [theme]);

  return (
    <div className={`App`}>
      <header className="App-header">
        <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
      </header>
      <div>
        
      </div>
    </div>
  );
}

export default App;