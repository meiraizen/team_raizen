import React, { useState } from 'react';
import './diet-styles.css'; 
import dietData from './dietData.json';

// Workout data remains local to keep the component functional
const workoutData = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  schedule: {
    Monday: { title: "Active Recovery", focus: "Glycogen Replenishment", exercises: [{ name: "Zone 2 Cardiovascular Work", sets: "1", reps: "30-45m", rest: "N/A", rationale: "Brisk walking/cycling at 110-130 BPM. Enhances mitochondrial density." }] },
    Tuesday: { title: "Push 2", focus: "Hypertrophy & Metabolic Volume", exercises: [ { name: "Dumbbell Bench Press", sets: "4", reps: "8-10", rest: "90s", rationale: "Deeper ROM than barbell; requires unilateral stabilization." }, { name: "Seated DB Shoulder Press", sets: "3", reps: "8-10", rest: "90s", rationale: "Anterior deltoid isolation." }, { name: "Chest Dips", sets: "3", reps: "AMRAP", rest: "90s", rationale: "Bodyweight mastery; targets sternocostal pectoralis head." }, { name: "Cable Lateral Raises", sets: "3", reps: "15-20", rest: "60s", rationale: "Constant tension on medial deltoid." }, { name: "Overhead Triceps Ext.", sets: "3", reps: "12-15", rest: "60s", rationale: "Long head of triceps in stretched position." } ] },
    Wednesday: { title: "Pull 2", focus: "Latissimus Width & Grip Endurance", exercises: [ { name: "Weighted Pull-up", sets: "4", reps: "6-8", rest: "120s", rationale: "Maximum mechanical tension on latissimus dorsi." }, { name: "Seated Cable Row", sets: "3", reps: "10-12", rest: "90s", rationale: "Rhomboid thickness via neutral grip." }, { name: "Single-Arm DB Row", sets: "3", reps: "10/arm", rest: "90s", rationale: "Unilateral lat isolation with maximal bottom stretch." }, { name: "Reverse Pec Deck", sets: "3", reps: "15", rest: "60s", rationale: "Strict posterior deltoid machine isolation." }, { name: "Barbell Preacher Curls", sets: "3", reps: "10-12", rest: "60s", rationale: "Biceps short head isolation." } ] },
    Thursday: { title: "Legs 2", focus: "Athletic Output & Core Integration", exercises: [ { name: "Bulgarian Split Squats", sets: "3", reps: "8-10", rest: "90s", rationale: "Intense unilateral quad/glute activation." }, { name: "Leg Press", sets: "3", reps: "10-12", rest: "90s", rationale: "Lower body load accumulation without spinal compression." }, { name: "Leg Extensions", sets: "3", reps: "12-15", rest: "60s", rationale: "Direct rectus femoris isolation." }, { name: "Hanging Leg Raises", sets: "3", reps: "10-15", rest: "60s", rationale: "Rectus abdominis flexion." }, { name: "Farmer's Carries", sets: "3", reps: "30m", rest: "60s", rationale: "Dynamic isometric core stability and grip endurance." } ] },
    Friday: { title: "Push 1", focus: "Anterior Strength & Power", exercises: [ { name: "Plyometric Push-Ups", sets: "3", reps: "5-8", rest: "90s", rationale: "Primes CNS; explosive anterior power." }, { name: "Barbell Bench Press", sets: "4", reps: "5-7", rest: "120s", rationale: "Primary compound horizontal press." }, { name: "Overhead Military Press", sets: "3", reps: "6-8", rest: "120s", rationale: "Primary vertical press." }, { name: "Incline DB Press", sets: "3", reps: "8-10", rest: "90s", rationale: "Targets clavicular head (upper chest)." }, { name: "DB Lateral Raises", sets: "3", reps: "12-15", rest: "60s", rationale: "Direct lateral deltoid isolation." }, { name: "Triceps Rope Pushdown", sets: "3", reps: "10-12", rest: "60s", rationale: "Pure elbow extension." } ] },
    Saturday: { title: "Pull 1", focus: "Posterior Thickness & Posture", exercises: [ { name: "Medicine Ball Slams", sets: "3", reps: "8-10", rest: "90s", rationale: "Explosive power, rapid lat activation." }, { name: "Barbell Row", sets: "4", reps: "6-8", rest: "120s", rationale: "Primary horizontal pull." }, { name: "Lat Pulldown", sets: "3", reps: "8-10", rest: "90s", rationale: "Vertical pull targeting width." }, { name: "Cable Face Pulls", sets: "3", reps: "12-15", rest: "60s", rationale: "Posterior deltoid and rotator cuff health." }, { name: "Barbell Shrugs", sets: "3", reps: "10-12", rest: "60s", rationale: "Direct scapular elevation." }, { name: "DB Hammer Curls", sets: "3", reps: "10-12", rest: "60s", rationale: "Brachialis targeting." } ] },
    Sunday: { title: "Legs 1", focus: "Absolute Lower Body Strength", exercises: [ { name: "Box Jumps", sets: "3", reps: "5", rest: "90s", rationale: "Plyometric fast-twitch activation." }, { name: "Barbell Back Squat", sets: "4", reps: "5-7", rest: "120s", rationale: "Foundational pillar." }, { name: "Romanian Deadlift", sets: "3", reps: "8-10", rest: "90s", rationale: "Pure hip hinge; hamstring lengthening." }, { name: "Stationary Lunges", sets: "3", reps: "10/leg", rest: "90s", rationale: "Unilateral stability." }, { name: "Lying Leg Curls", sets: "3", reps: "10-12", rest: "60s", rationale: "Hamstring isolation." }, { name: "Standing Calf Raises", sets: "4", reps: "15-20", rest: "60s", rationale: "Gastrocnemius development." } ] }
  }
};

const Diet = () => {
  const [selectedDay, setSelectedDay] = useState('Friday');

  const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="recomp-accordion">
        <button className="recomp-accordion-header" onClick={() => setIsOpen(!isOpen)}>
          <span>{title}</span>
          <span style={{ color: 'var(--primary-dark)', fontSize: '1.2rem', fontWeight: '400' }}>
            {isOpen ? '−' : '+'}
          </span>
        </button>
        {isOpen && <div className="recomp-accordion-body">{children}</div>}
      </div>
    );
  };

  const currentWorkout = workoutData.schedule[selectedDay];
  
  // Parse the current day's diet from the imported JSON
  const currentDietProtocol = dietData.diet_protocol.weekly_schedule[selectedDay];
  const dietTargets = dietData.diet_protocol.daily_targets;

  return (
    <div className="recomp-app-wrapper">
      
      {/* Hero Header */}
      <header className="recomp-hero">
        <div className="recomp-hero-subtitle">Clinical Protocol Dashboard</div>
        <h1>9-Week Athletic Recomposition</h1>
        <div className="recomp-metrics-row">
          <span className="recomp-metric-pill">🎯 {dietTargets.calories} Daily</span>
          <span className="recomp-metric-pill">🥩 {dietTargets.protein} Target</span>
          <span className="recomp-metric-pill">📊 28.2% BF Baseline</span>
          <span className="recomp-metric-pill">⏳ Goal: May Week 1</span>
        </div>
      </header>

      {/* Global Navigation Tabs */}
      <nav className="recomp-nav recomp-scrollable">
        {workoutData.days.map(day => (
          <button 
            key={day} 
            className={`recomp-nav-btn ${selectedDay === day ? 'recomp-active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </nav>

      <div className="recomp-layout">
        
        {/* LEFT COLUMN: Workout Periodization */}
        <div className="recomp-col">
          <section className="recomp-card" style={{ marginBottom: '30px' }}>
            <div className="recomp-card-header">
              <h2 className="recomp-card-title">{currentWorkout.title}</h2>
              <div className="recomp-card-subtitle">{currentWorkout.focus}</div>
            </div>

            <div className="recomp-workout-container recomp-scrollable">
              <div className="recomp-grid-header">
                <div>Exercise</div>
                <div style={{ textAlign: 'center' }}>Sets</div>
                <div style={{ textAlign: 'center' }}>Reps</div>
                <div style={{ textAlign: 'center' }}>Rest</div>
                <div>Rationale</div>
              </div>
              
              {currentWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="recomp-grid-row">
                  <div className="recomp-cell-title">{ex.name}</div>
                  <div className="recomp-mobile-metrics">
                    <div className="recomp-cell-metric">{ex.sets} Sets</div>
                    <div className="recomp-cell-metric">{ex.reps}</div>
                    <div className="recomp-cell-metric">{ex.rest}</div>
                  </div>
                  <div className="recomp-cell-rationale">{ex.rationale}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Clinical Insights */}
          <section className="recomp-card">
            <h2 className="recomp-card-title">Clinical Analysis</h2>
            <div className="recomp-accordion-wrapper">
              <Accordion title="Anthropometric Baseline (US Navy Method)">
                <p><strong>Baseline BF:</strong> 28.2% (Calculated via 163cm height, 38.5" umbilical circ., 15.2" neck).</p>
                <p style={{ marginTop: '10px' }}><strong>Note:</strong> A 3.5-inch discrepancy exists between the natural waistline (35") and umbilicus (38.5"), indicating a clinical priority to oxidize visceral adipose tissue alongside subcutaneous fat.</p>
              </Accordion>
              <Accordion title="PPL Split vs. Body-Part Paradigm">
                <p>Body-Part splits train a muscle once every 7 days, wasting the anabolic window (which closes in 48 hours). The Push-Pull-Legs protocol stimulates synergistic kinetic chains every 72-96 hours, resulting in repeated spikes of muscle protein synthesis.</p>
              </Accordion>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Dietary Architecture via JSON */}
        <div className="recomp-col">
          <section className="recomp-card">
            <div className="recomp-card-header">
              <h2 className="recomp-card-title">Dietary Options</h2>
              <div className="recomp-card-subtitle">Select preferred meal option for the day</div>
            </div>

            <div className="recomp-timeline">
              {Object.keys(currentDietProtocol).map((mealName, idx) => {
                const options = currentDietProtocol[mealName];
                
                // If the array is empty (no options for this meal on this day), skip rendering
                if (!options || options.length === 0) return null;

                return (
                  <div key={idx} className="recomp-timeline-item">
                    <div className="recomp-timeline-dot"></div>
                    <div className="recomp-meal-type">{mealName.replace('_', ' ')}</div>
                    
                    {options.map((opt, optIdx) => (
                      <div key={optIdx} className="recomp-meal-option">
                        <div className="recomp-meal-food">
                          <span className="recomp-opt-label">Option {opt.option}</span> 
                          {opt.description}
                        </div>
                        <div className="recomp-meal-tags">
                          <span className="recomp-tag">{opt.macros}</span>
                          <span className="recomp-tag" style={{ background: 'var(--accent-mint)', color: 'var(--primary-dark)' }}>
                            ⭐ {opt.micros}
                          </span>
                          {opt.immune_boosters !== "None" && (
                            <span className="recomp-tag" style={{ border: '1px solid #ffd166', color: '#e07a5f' }}>
                              🛡️ {opt.immune_boosters}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Diet;