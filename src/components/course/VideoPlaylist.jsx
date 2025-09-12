import React, { useState, useEffect, useRef, useMemo } from 'react';
import './videoplaylist.css';
import { lessons } from './VideoData';

const VideoPlaylist = () => {
  // --- STATE MANAGEMENT (Static for PoC) ---
  const [selectedVideoId, setSelectedVideoId] = useState(
    lessons[0]?.subtopics[0]?.id
  );
  const [expandedLessonIndex, setExpandedLessonIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // --- REFS ---
  const activeItemRef = useRef(null);

  // --- DERIVED STATE & MEMOIZATION ---
  const totalVideos = useMemo(() =>
    lessons.reduce((count, lesson) => count + lesson.subtopics.length, 0),
  []);

  const progressPercent = totalVideos > 0 ? (completedVideos.size / totalVideos) * 100 : 0;

  const findVideoDetails = (videoId) => {
    for (const lesson of lessons) {
      for (const topic of lesson.subtopics) {
        if (topic.id === videoId) return { title: topic.title, lessonTitle: lesson.title };
      }
    }
    return { title: 'Welcome!', lessonTitle: 'Course Introduction' };
  };

  const currentVideoDetails = findVideoDetails(selectedVideoId);

  const filteredLessons = useMemo(() => {
    if (!searchTerm.trim()) {
        return lessons.map((lesson, index) => ({...lesson, originalIndex: index}));
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return lessons.reduce((acc, lesson, index) => {
        const hasMatchingTitle = lesson.title.toLowerCase().includes(lowerCaseSearch);
        const filteredSubtopics = lesson.subtopics.filter(topic => topic.title.toLowerCase().includes(lowerCaseSearch));

        if (hasMatchingTitle || filteredSubtopics.length > 0) {
            acc.push({ ...lesson, originalIndex: index, subtopics: hasMatchingTitle ? lesson.subtopics : filteredSubtopics });
        }
        return acc;
    }, []);
  }, [searchTerm]);

  // --- EFFECTS ---
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedVideoId]);

  useEffect(() => {
    setIsVideoLoading(true);
  }, [selectedVideoId]);

  // --- HANDLERS ---
  const handleVideoSelect = (videoId) => {
    setSelectedVideoId(videoId);
    setCompletedVideos(prev => new Set(prev).add(videoId));
  };

  const toggleLesson = (index) => {
    setExpandedLessonIndex(expandedLessonIndex === index ? null : index);
  };
  

  return (
    <>
      <div className="page-header-container">
        <a href="/home" className="back-button">
          &larr; Back to home
        </a>
      </div>
      <div className="online-course-container">
        <div className="main-content-area">
          <div className="video-player-wrapper">
            {isVideoLoading && <div className="skeleton-loader"></div>}
            <iframe
              key={selectedVideoId}
              src={`https://drive.google.com/file/d/${selectedVideoId}/preview`}
              onLoad={() => setIsVideoLoading(false)}
              style={{ display: isVideoLoading ? 'none' : 'block' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={currentVideoDetails.title}
            ></iframe>
          </div>
          <div className="video-title-container">
            <h2>{currentVideoDetails.title}</h2>
            <p>From: {currentVideoDetails.lessonTitle}</p>
          </div>
        </div>

        <div className="course-playlist-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-heading">Raizen Online Dojo</h2>
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Search lessons..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
              <span className="progress-text">{completedVideos.size} / {totalVideos} Complete ({Math.round(progressPercent)}%)</span>
            </div>
          </div>

          <div className="lesson-list-scrollable">
            {filteredLessons.length > 0 ? filteredLessons.map((lesson) => (
              <div key={lesson.originalIndex} className="lesson-module-card">
                <h3 className="lesson-header-container">
                  <button
                    className="lesson-header-elite"
                    onClick={() => toggleLesson(lesson.originalIndex)}
                    aria-expanded={expandedLessonIndex === lesson.originalIndex}
                    aria-controls={`lesson-content-${lesson.originalIndex}`}
                  >
                    <span className="lesson-info">
                      <span className="lesson-number">Lesson {lesson.originalIndex + 1}</span>
                      <span className="lesson-title-elite">{lesson.title}</span>
                    </span>
                    <span
                      className={`accordion-icon ${expandedLessonIndex === lesson.originalIndex ? 'expanded' : ''}`}
                      aria-hidden="true"
                    >&#9660;</span>
                  </button>
                </h3>
                <div className="subtopic-list-wrapper" data-state={expandedLessonIndex === lesson.originalIndex ? 'open' : 'closed'}>
                  <div className="subtopic-list-inner">
                    <ul id={`lesson-content-${lesson.originalIndex}`} className="subtopic-list-elite">
                       {lesson.subtopics.map((topic) => (
                          <li
                              key={topic.id}
                              ref={selectedVideoId === topic.id ? activeItemRef : null}
                              className={`subtopic-item-elite ${selectedVideoId === topic.id ? 'active' : ''}`}
                              aria-current={selectedVideoId === topic.id ? 'true' : 'false'}
                          >
                              <button onClick={() => handleVideoSelect(topic.id)}>
                                  <span className="subtopic-title">{topic.title}</span>
                                  <span className="play-status-icon" aria-hidden="true">
                                      {completedVideos.has(topic.id) && selectedVideoId !== topic.id && '✓'}
                                      {selectedVideoId === topic.id && '►'}
                                      {!completedVideos.has(topic.id) && selectedVideoId !== topic.id && '◯'}
                                  </span>
                                  <span className="sr-only">{selectedVideoId === topic.id ? 'Currently playing' : 'Play video'}: {topic.title}</span>
                              </button>
                          </li>
                       ))}
                    </ul>
                  </div>
                </div>
              </div>
            )) : <p className="no-results">No lessons found for "{searchTerm}"</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlaylist;