import React, { createContext, useContext, useState } from 'react';
import { DefaultTheme, DarkTheme } from 'react-native-paper';

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#5de07a',
    accent: '#b1e28bff',
    background: '#111',
    surface: '#222',
    text: '#fff',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useThemeContext = () => useContext(ThemeContext);
