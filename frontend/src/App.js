
import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { GlobalProvider } from './components/Context/Context';

function App() {
  return (
    <GlobalProvider>
      <AppRoutes />
    </GlobalProvider>
  );
}

export default App;
