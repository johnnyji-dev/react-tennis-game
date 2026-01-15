import React from 'react';
import './TennisBall.css';

// CSS 기반 테니스공 컴포넌트 (첨부 스타일 참고)
const TennisBall = ({ x, y, z = 0, rotation = 0 }) => {
  // z=0 => 1배, z=100 => 1.5배
  const scale = 1 + z / 200;
  const shadowScale = scale * 0.9;

  return (
    <div className="tennis-ball-wrapper" style={{ left: `${x}px`, top: `${y}px` }}>
      <div
        className="tennis-ball"
        style={{
          transform: `translate(-50%, -50%) scale(${scale}) rotate(0deg) rotateX(25deg) rotateY(${rotation}deg)`
        }}
      />
      <div
        className="tennis-ball__shadow"
        style={{ transform: `translate(-50%, -50%) scale(${shadowScale})` }}
      />
    </div>
  );
};

export default TennisBall;
