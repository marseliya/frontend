import React, { useState, useEffect, useCallback } from "react";

const ToastContext = React.createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = ++toastIdCounter;

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          duration,
        },
      ]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message, duration) => addToast(message, "success", duration),
    [addToast]
  );

  const error = useCallback(
    (message, duration) => addToast(message, "error", duration),
    [addToast]
  );

  const warning = useCallback(
    (message, duration) => addToast(message, "warning", duration),
    [addToast]
  );

  const info = useCallback(
    (message, duration) => addToast(message, "info", duration),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        addToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, Math.max(0, toast.duration - 300));

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const typeConfig = {
    success: {
      bgClass: "toast-success",
    },
    error: {
      bgClass: "toast-error",
    },
    warning: {
      bgClass: "toast-warning",
    },
    info: {
      bgClass: "toast-info",
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      className={`toast-item ${config.bgClass} ${
        isExiting ? "toast-exit" : "toast-enter"
      }`}
      role="alert"
    >
      <div className="toast-message">{toast.message}</div>

      <button
        className="toast-close"
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default ToastProvider;