import React from "react";

export const renderModal = (modalComp, templates, openModals, renderComponent) => {
  if (!openModals.has(modalComp.id)) {
    return null;
  }

  const modalTemplate = templates["Modal"];
  const modalStyle = {
    ...(modalTemplate?.style || {}),
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
