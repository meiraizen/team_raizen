import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton.jsx";
import Certificates from "../components/Certificates.jsx";
import CustomLoader from "../components/CustomLoader.jsx";
import { studentsData } from "../components/tempDatabase.js";

export default function VerifyCertificate() {
  // Add BoxIcons CSS dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/boxicons@2.0.5/css/boxicons.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [student, setStudent] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (evt) => {
    const value = evt.target.value;
    setSearchValue(value);
    setStudent(null);
    setError("");

    if (!value.trim()) {
      setFilteredStudents([]);
      setShowResults(false);
      return;
    }

    // Filter students by name or ID
    const filtered = studentsData.filter((student) => {
      const searchTerm = value.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchTerm) ||
        String(student.id).includes(searchTerm)
      );
    });

    setFilteredStudents(filtered);
    setShowResults(true);
  };

  const handleStudentSelect = (selectedStudent) => {
    setStudent(selectedStudent);
    setSearchValue(selectedStudent.name);
    setShowResults(false);
    setFilteredStudents([]);
    setLoading(true);

    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleFocus = () => {
    if (searchValue && filteredStudents.length > 0) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleRemove = () => {
    setSearchValue("");
    setFilteredStudents([]);
    setShowResults(false);
    setStudent(null);
    setError("");
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<b>$1</b>');
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', background: '#f4f7f8' }}>
      <BackButton />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        fontFamily: 'Poppins, sans-serif',
        color: 'rgb(44, 62, 80)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '2rem',
          color: 'rgb(44, 62, 80)',
          textAlign: 'center'
        }}>
          Verify Certificate
        </h1>

        {/* Custom Search Component */}
        <div className={`con-search ${!searchValue ? 'notValue' : ''} ${showResults ? 'focus' : ''}`}>
          <div className="con-input">
            <input 
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder="Search by Name or ID" 
              onInput={handleSearch}
              value={searchValue}
              onChange={handleSearch}
              type="text"
            />
            <i className='bx bx-search'></i>
            <i onClick={handleRemove} className='bx bx-x'></i>
          </div>
          <div className="content-results">
            <div className="con-results">
              {filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="result"
                  onClick={() => handleStudentSelect(student)}
                  style={{ 
                    animationDelay: `${index * 20}ms`,
                    opacity: 1,
                    marginTop: 0
                  }}
                >
                  <h5 dangerouslySetInnerHTML={{
                    __html: highlightMatch(student.name, searchValue)
                  }} />
                  <p>ID: {student.id} | Belt Level: {student.belt_level}</p>
                  <div className="web">Click to select</div>
                </div>
              ))}
            </div>
            <div className="not-results">No Results Found</div>
          </div>
        </div>

        {/* Loading */}
        {loading && <CustomLoader />}

        {/* Error */}
        {error && (
          <div style={{ 
            color: '#f44336', 
            marginBottom: '1rem',
            fontSize: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* Certificate Display */}
        {student && !loading && (
          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: '2rem' }}>
            <Certificates
              name={student.name}
              course={`Belt Level: ${student.belt_level}`}
              date={student.exam_records?.[student.exam_records.length - 1]?.date}
            />
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        * {
          list-style: none;
          outline: none;
          padding: 0;
          margin: 0;
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
        }

        .con-search {
          position: relative;
          width: 400px;
          max-width: 100%;
        }

        .focus .content-results {
          opacity: 1;
          visibility: visible;
          transform: translate(0, 0);
        }

        .con-input {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .con-input i {
          position: absolute;
          right: 15px;
          font-size: 1.5rem;
          transition: all .25s ease;
          opacity: .5;
        }

        .notValue .con-input i.bx-search {
          display: block;
        }

        .con-input i.bx-search {
          display: none;
        }

        .notValue .con-input i.bx-x {
          display: none;
        }

        .con-input i.bx-x {
          display: block;
          cursor: pointer;
        }

        .con-input input {
          width: 100%;
          padding: 15px 20px;
          box-sizing: border-box;
          border: 0px;
          border-radius: 20px;
          transition: all .25s ease;
          background: white;
          font-size: 1rem;
        }

        .con-input input:focus {
          transform: translate(0, -6px);
          box-shadow: 0px 10px 20px 0px rgba(0,0,0,.05);
        }

        .con-input input:focus ~ i {
          transform: translate(0, -6px);
          opacity: 1;
        }

        .content-results {
          position: absolute;
          width: 100%;
          background: #fff;
          margin-top: 10px;
          border-radius: 25px;
          box-shadow: 0px 10px 20px 0px rgba(0,0,0,.05);
          transform: translate(0, -10px);
          transition: all .25s ease;
          opacity: 0;
          z-index: 10;
          visibility: hidden;
          padding-right: 10px;
          overflow: hidden;
        }

        .con-results {
          width: 100%;
          overflow: auto;
          max-height: 300px;
          margin-top: 10px;
          margin-bottom: 10px;
        }

        .con-results:empty {
          margin-top: 0px;
          margin-bottom: 0px;
        }

        .not-results {
          text-align: center;
          padding: 15px;
          font-size: .9rem;
          opacity: .7;
          display: none;
          color: rgba(244, 0, 0, 1);
        }

        .con-search:not(.notValue) .con-results:empty ~ .not-results {
          display: block;
        }

        .con-results .result {
          padding: 15px;
          margin: 5px 0px;
          list-style: none;
          transition: all .25s ease;
          position: relative;
          cursor: pointer;
          width: calc(100% - 10px);
          margin-left: 10px;
          border-radius: 20px;
        }

        .con-results .result:hover {
          background: #f4f7f8;
        }

        .con-results .result p {
          font-size: .9rem;
          color: rgba(44, 62, 80, .6);
        }

        .con-results .result h5 {
          margin: 0 0 5px 0;
          font-size: 1rem;
        }

        .con-results .result b {
          background: rgba(44, 62, 80, .1);
          text-decoration: underline;
          color: rgba(44, 62, 80, 1);
          border-radius: 2px;
        }

        .web {
          position: absolute;
          right: 0px;
          top: 0px;
          font-size: .8rem;
          color: rgba(44, 62, 80, .5);
          padding: 20px;
        }

        .hidden {
          opacity: 0;
          margin-top: -15px;
        }

        .con-results::-webkit-scrollbar {
          width: 5px;
        }

        .con-results::-webkit-scrollbar-thumb {
          border-radius: 5px;
          background: #000;
        }
      `}</style>
    </div>
  );
}