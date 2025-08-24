import React from "react";

const ICON_URL = "https://img.icons8.com/?size=256&id=am4ltuIYDpQ5&format=png";

// Utility: Convert date string to readable month-year (e.g., "Jan 2025")
const getMonthYearLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
};

// Utility: Get timestamp for sorting
const getDateTimestamp = (dateStr) => new Date(dateStr).getTime();

// Styles
const styles = {
  container: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  baseBox: {
    height: "90px",
    width: "90px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: "15px",
    boxSizing: "border-box",
    position: "relative",
    cursor: "pointer",
    border: "2px solid transparent",
  },
  disabled: {
    color: "grey",
    borderColor: "grey",
    pointerEvents: "none",
    opacity: 0.5,
    cursor: "not-allowed",
  },
  label: {
    fontSize: "14px",
    fontWeight: 800,
    margin: "0 0 5px 0",
  },
  icon: {
    width: "20px",
    height: "20px",
    marginTop: "5px",
  },
};

const MonthGrid = ({ feeHistory = [] }) => {
  const currentDate = new Date();

  // Filter and sort valid fee entries by date
  const validFees = feeHistory
    .filter((fee) => fee.date && !isNaN(new Date(fee.date)))
    .sort((a, b) => getDateTimestamp(a.date) - getDateTimestamp(b.date));

  return (
    <div style={styles.container}>
      {validFees.map((fee, index) => {
        const feeDate = new Date(fee.date);
        const isFuture = feeDate > currentDate;
        const borderColor = isFuture
          ? "grey"
          : fee.paid
          ? "green"
          : "red";

        const combinedStyle = {
          ...styles.baseBox,
          borderColor,
          ...(isFuture ? styles.disabled : {}),
        };

        return (
          <div key={index} style={combinedStyle} className="month-grid__box">
            <p style={styles.label} className="month-grid__label">
              {getMonthYearLabel(fee.date)}
            </p>
            {!isFuture && (
              <img
                src={ICON_URL}
                alt="calendar icon"
                style={styles.icon}
                className="month-grid__icon"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MonthGrid;
