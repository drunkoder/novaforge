import React, { createContext, useState } from 'react';

const ToastContext = createContext({
  addToast: () => {},
});

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    setToasts((prevToasts) => [...prevToasts, { type, message }]);
  };

  return (
    <ToastContext.Provider value={{ addToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export { ToastContext, ToastProvider };