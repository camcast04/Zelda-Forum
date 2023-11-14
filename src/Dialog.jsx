//Dialog.jsx

import { useEffect, useRef, useState } from 'react';

export default function Dialog({
  allowClose = true,
  contents,
  open,
  dialogStateChange = () => {},
}) {
  const [showModal, setShowModal] = useState(open);
  const dialog = useRef(null);

  useEffect(() => {
    if (open !== showModal) {
      setShowModal(open);
    }
  }, [open]);

  function updateDialogState(open) {
    setShowModal(open);
    dialogStateChange(open);
  }

  return showModal ? (
    <>
      <div className="dialog-container"></div>
      <div
        onClick={({ target }) => {
          if (!allowClose || dialog.current?.contains(target)) {
            return;
          }
          updateDialogState(false);
        }}
        onKeyDown={({ key }) => {
          if (!allowClose || key !== 'Escape') {
            return;
          }
          updateDialogState(false);
        }}
        className="dialog-backdrop"
      >
        <div className="dialog-placement">
          <div className="relative group">
            <div className="dialog-accent-border group-hover:opacity-100 group-hover:duration-2000"></div>
            <div ref={dialog} className="dialog-content-container">
              {contents}
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;
}
