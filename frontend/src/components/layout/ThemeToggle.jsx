import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200
      dark:hover:bg-zinc-700 dark:hover:text-yellow-500">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;