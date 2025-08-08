import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <button onClick={handleClick}>
      <style jsx>{`
        button {
          background-color: white;
          color: black;
          height: 30px;
          // padding: 0 16px;
          font-size: 16px;
          font-weight: 600;
          // padding: 1em 2em;
           // border-radius: 10em;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: 1px solid black;
          box-shadow: 0 0 0 0 black;
          display: flex;
          align-items: center;
        }

        button:hover {
          transform: translateY(-4px) translateX(-2px);
          box-shadow: 2px 2px 0 0 black;
          background-color: white;
        }

        button:active {
          transform: translateY(2px) translateX(1px);
          box-shadow: 0 0 0 0 black;
        }
      `}</style>
      Back
    </button>
  );
};

export default BackButton;
          
        