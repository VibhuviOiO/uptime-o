import React from 'react';
import './Loading.css'; // Create this CSS file for styles

const Loading: React.FC = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading status...</p>
  </div>
);

export default Loading;
