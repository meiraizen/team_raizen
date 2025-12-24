import React, { useState } from 'react';
import { supabase } from '../../chat/supabaseClient'; // Adjust path based on where your client file is
import styles from './AddStudent.module.css';

const AddStudent = () => {
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '', id: null });

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Reset states
    setIsLoading(true);
    setFeedback({ type: '', message: '', id: null });

    try {
      if (!fullName.trim()) throw new Error('Student name is required.');

      // 1. Insert into Supabase
      // We do NOT send 'id'. Database generates it.
      const { data, error } = await supabase
        .from('students')
        .insert([{ full_name: fullName }])
        .select(); // IMPORTANT: This retrieves the newly created row

      if (error) throw error;

      // 2. Handle Success
      if (data && data.length > 0) {
        const newStudent = data[0];
        setFeedback({
          type: 'success',
          message: 'Student registered successfully!',
          id: newStudent.id
        });
        setFullName(''); // Clear form
      }

    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Something went wrong.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register New Student</h2>
        
        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="studentName" className={styles.label}>
              Full Name
            </label>
            <input
              id="studentName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter student name"
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Generate Student ID'}
          </button>
        </form>

        {/* Feedback Section */}
        {feedback.message && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}>
            <p>{feedback.message}</p>
            {feedback.type === 'success' && (
              <div className={styles.idDisplay}>
                <span>Generated ID:</span>
                <strong>{feedback.id}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudent;