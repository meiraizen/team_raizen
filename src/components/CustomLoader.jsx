import React from 'react';

const CustomLoader = ({ 
  size = 40, 
//   color = 'rgb(25,91,255)', 
  color = 'rgba(16, 15, 15, 1)', 
  backgroundColor = '#f3f3f3',
  minHeight = '200px',
  margin = '2rem 0'
}) => {
  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: minHeight,
        margin: margin,
        width: "100%",
      }}>
        <div className="custom-spinner" style={{
          border: `4px solid ${backgroundColor}`,
          borderTop: `4px solid ${color}`,
          borderRadius: '50%',
          width: `${size}px`,
          height: `${size}px`,
        }}></div>
      </div>

      <style jsx>{`
        .custom-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default CustomLoader;
