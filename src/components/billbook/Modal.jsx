
import React, { useEffect, useRef } from "react";
import closeicon from '../../assets/closeicon.svg';
import { IconButton } from "@mui/material";

export default function Modal({ isOpen, onClose, children }) {
    const modalRef = useRef(null);


    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        function handleEsc(e) {
            if (e.key === "Escape") onClose();
        }

        if (isOpen) window.addEventListener("keydown", handleEsc);
        else window.removeEventListener("keydown", handleEsc);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "1rem",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                ref={modalRef}
                style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    maxWidth: 500,
                    width: "100%",
                    maxHeight: "90vh",
                    padding: "1.5rem",
                    boxSizing: "border-box",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <img src={closeicon} alt="close" style={{
                    width: 30, height: 30, position: "absolute",
                    top: 16,
                    right: 16,
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    lineHeight: 1,
                }}
                    onClick={onClose} />

                {/* <button
          onClick={onClose}
          aria-label="Close modal"
         
        >
        <span style={{color:'black'}}> x</span>
        </button> */}
                {children}
            </div>
        </div>
    );
}
