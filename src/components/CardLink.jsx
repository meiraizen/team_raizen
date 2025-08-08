import React from "react";
import { useNavigate } from "react-router-dom";

// Google Fonts import for Alegreya Sans SC
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css?family=Alegreya+Sans+SC";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Responsive styles injected into the document head
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  .card-link-custom {
    height: 200px;
    width: 275px;
    background: #fff;
    padding: 40px 20px 60px 20px;
    border-radius: 10px;
    transition: all 300ms ease;
    cursor: pointer;
    box-sizing: border-box;
    font-family: 'Alegreya Sans SC', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    outline: none;
  }
  .card-link-custom:hover {
    box-shadow: 20px 20px 0px 0px rgba(0, 0, 0, 0.3);
    border: 1px solid #1f3b64;
    transform: translate(-5px,-5px);
  }
  .card-link-title {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 0.5em;
    color: #0b0b0cff;
    text-align: center;
  }
  .card-link-desc {
    font-size: 1rem;
    color: #333;
    text-align: center;
  }
  @media (max-width: 500px) {
    .card-link-custom {
      width: 90vw;
      min-width: 140px;
      height: auto;
      padding: 20px 10px 30px 10px;
    }
    .card-link-title {
      font-size: 1.1rem;
    }
    .card-link-desc {
      font-size: 0.95rem;
    }
  }
`;
document.head.appendChild(styleTag);

const CardLink = ({ title, description, to }) => {
  const navigate = useNavigate();
  const [hover, setHover] = React.useState(false);

  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <div
      className="card-link-custom"
      style={hover ? { boxShadow: "10px 10px 0px 0px rgba(0, 0, 0, 0.3)", border: "1px solid #050a12ff", transform: "translate(-5px,-5px)" } : {}}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-pressed="false"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <div className="card-link-title">{title}</div>
      <div className="card-link-desc">{description}</div>
    </div>
  );
};

export default CardLink;