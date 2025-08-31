// src/context/ModalContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import Modal from './Modal'

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);

  const openModal = useCallback((content) => {
    setModalContent(() => content);
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalContent && (
        <Modal isOpen={true} onClose={closeModal}>
          {modalContent}
        </Modal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
