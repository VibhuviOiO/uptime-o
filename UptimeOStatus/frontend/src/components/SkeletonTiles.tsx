import React from 'react';
import './SkeletonTiles.css';

const SkeletonTiles: React.FC = () => (
  <div className="skeleton-container">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="skeleton-tile">
        <div className="skeleton-header"></div>
        <div className="skeleton-body"></div>
        <div className="skeleton-footer"></div>
      </div>
    ))}
  </div>
);

export default SkeletonTiles;
