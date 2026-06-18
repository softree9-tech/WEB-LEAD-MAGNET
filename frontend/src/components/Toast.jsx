import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 20 }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: 'white',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          borderLeft: `4px solid ${type === 'success' ? '#10b981' : '#ef4444'}`,
        }}
      >
        {type === 'success' ? (
          <CheckCircle size={20} color="#10b981" />
        ) : (
          <XCircle size={20} color="#ef4444" />
        )}
        <div style={{ flex: 1, fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            padding: '2px',
          }}
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
