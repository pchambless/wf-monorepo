import React from "react";

export const renderModal = (modalComp, openModals, renderComponent) => {
  if (!openModals.has(modalComp.id)) {
    return null;
  }

  // Default modal styles - can be overridden by modalComp.override_styles
  const defaultModalStyle = {
    position: "relative",
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    maxWidth: "600px",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const modalStyle = {
    ...defaultModalStyle,
    ...modalComp.override_styles,
  };

  const handleBackdropClick = () => {
    const event = new CustomEvent("closeModal", {
      detail: { modalId: modalComp.id },
    });
    window.dispatchEvent(event);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <React.Fragment key={modalComp.id}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleBackdropClick}
      >
        <div style={modalStyle} onClick={handleModalClick}>
          {renderComponent(modalComp)}
        </div>
      </div>
    </React.Fragment>
  );
};
