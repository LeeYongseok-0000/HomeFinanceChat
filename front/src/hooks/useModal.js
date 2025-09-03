import { useState } from "react";

const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    content: "",
    callback: null,
  });

  const showModal = (title, content, callback = null) => {
    setModalState({
      isOpen: true,
      title,
      content,
      callback,
    });
  };

  const hideModal = () => {
    setModalState({
      isOpen: false,
      title: "",
      content: "",
      callback: null,
    });
  };

  const handleModalClose = () => {
    if (modalState.callback) {
      modalState.callback();
    }
    hideModal();
  };

  return {
    modalState,
    showModal,
    hideModal,
    handleModalClose,
  };
};

export default useModal;
