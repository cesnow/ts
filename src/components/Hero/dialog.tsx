// components/Dialog.tsx
import React, { useState, useEffect, ReactNode } from 'react';

const Dialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent) => {
      setContent(event.detail);
      setIsOpen(true);
    };

    const handleCloseDialog = () => {
      setIsOpen(false);
    };

    window.addEventListener('open-dialog', handleOpenDialog as any);
    window.addEventListener('close-dialog', handleCloseDialog);

    return () => {
      window.removeEventListener('open-dialog', handleOpenDialog as any);
      window.removeEventListener('close-dialog', handleCloseDialog);
    };
  }, []);

  return isOpen ? (
    <div className="fixed top-0 left-0 inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-7 rounded-lg shadow-lg max-w-sm">
        {content}12
        <button onClick={() => setIsOpen(false)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Close</button>
      </div>
    </div>
  ) : null;
};

export default Dialog;
