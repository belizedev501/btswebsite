
import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { GlobalProvider } from './components/Context/Context';
import BtsChat from "./components/Chat/BtsChat";

function App() {
  return (
    <GlobalProvider>
      <AppRoutes />
      <BtsChat />
    </GlobalProvider>
  );
}

export default App;
