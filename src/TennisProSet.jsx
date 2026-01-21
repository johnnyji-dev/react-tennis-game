import React, { useEffect, useRef } from 'react';

// ITF 실제 규격 (미터) — 참고용
const COURT_REAL = {
  LENGTH: 23.77,
  WIDTH_SINGLES: 8.23,
  WIDTH_DOUBLES: 10.97,
  SERVICE_LINE: 6.4,
  NET_HEIGHT_CENTER: 0.914,
  NET_HEIGHT_POST: 1.07
};

// Canvas 사다리꼴 코트 (800x600px)
const COURT = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  OPPONENT_TOP_Y: 50,
  OPPONENT_BOTTOM_Y: 250,
  OPPONENT_WIDTH_TOP: 400,
  OPPONENT_WIDTH_BOTTOM: 600,
  PLAYER_TOP_Y: 350,
  PLAYER_BOTTOM_Y: 550,
  PLAYER_WIDTH_TOP: 600,
  PLAYER_WIDTH_BOTTOM: 800,
  NET_Y: 300,
  NET_HEIGHT: 40,
  NET_WIDTH: 10,
  SERVICE_LINE_Y: 200,
  PLAYER_SERVICE_Y: 400,
  SCALE: 1
};

// 물리 상수
const PHYSICS = {
  GRAVITY: 9.8,
  COR_GROUND: 0.75,
  COR_RACKET: 0.85,
  AIR_RESISTANCE: 0.99,
  DT: 1 / 60
};

const lerp = (a, b, t) => a + (b - a) * t;

const getCourtWidthAtY = y => {
  if (y < COURT.NET_Y) {
    const t = (y - COURT.OPPONENT_TOP_Y) / (COURT.OPPONENT_BOTTOM_Y - COURT.OPPONENT_TOP_Y);
    return lerp(COURT.OPPONENT_WIDTH_BOTTOM, COURT.OPPONENT_WIDTH_TOP, Math.min(Math.max(t, 0), 1));
  }
  const t = (y - COURT.PLAYER_TOP_Y) / (COURT.PLAYER_BOTTOM_Y - COURT.PLAYER_TOP_Y);
  return lerp(COURT.PLAYER_WIDTH_TOP, COURT.PLAYER_WIDTH_BOTTOM, Math.min(Math.max(t, 0), 1));
};

const TennisProSet = () => {
  const canvasRef = useRef(null);
  const courtType = 'doubles'; // 항상 doubles 코트만 표시

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const drawCourt = () => {
      ctx.clearRect(0, 0, COURT.CANVAS_WIDTH, COURT.CANVAS_HEIGHT);
      ctx.fillStyle = '#0c4a1c';
      ctx.fillRect(0, 0, COURT.CANVAS_WIDTH, COURT.CANVAS_HEIGHT);

      const centerX = COURT.CANVAS_WIDTH / 2;

      // Singles vs Doubles 비율 계산 (ITF 규격 기반)
      const widthRatio =
        courtType === 'singles'
          ? COURT_REAL.WIDTH_SINGLES / COURT_REAL.WIDTH_DOUBLES
          : 1.0;

      const oppTopLeft = {
        x: centerX - (COURT.OPPONENT_WIDTH_TOP / 2) * widthRatio,
        y: COURT.OPPONENT_TOP_Y
      };
      const oppTopRight = {
        x: centerX + (COURT.OPPONENT_WIDTH_TOP / 2) * widthRatio,
        y: COURT.OPPONENT_TOP_Y
      };
      const oppBottomLeft = {
        x: centerX - (COURT.OPPONENT_WIDTH_BOTTOM / 2) * widthRatio,
        y: COURT.OPPONENT_BOTTOM_Y
      };
      const oppBottomRight = {
        x: centerX + (COURT.OPPONENT_WIDTH_BOTTOM / 2) * widthRatio,
        y: COURT.OPPONENT_BOTTOM_Y
      };

      const plyTopLeft = {
        x: centerX - (COURT.PLAYER_WIDTH_TOP / 2) * widthRatio,
        y: COURT.PLAYER_TOP_Y
      };
      const plyTopRight = {
        x: centerX + (COURT.PLAYER_WIDTH_TOP / 2) * widthRatio,
        y: COURT.PLAYER_TOP_Y
      };
      const plyBottomLeft = {
        x: centerX - (COURT.PLAYER_WIDTH_BOTTOM / 2) * widthRatio,
        y: COURT.PLAYER_BOTTOM_Y
      };
      const plyBottomRight = {
        x: centerX + (COURT.PLAYER_WIDTH_BOTTOM / 2) * widthRatio,
        y: COURT.PLAYER_BOTTOM_Y
      };

      // Doubles일 경우 외곽 라인 (더 넓은 코트)
      if (courtType === 'doubles') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(oppTopLeft.x, oppTopLeft.y);
        ctx.lineTo(oppTopRight.x, oppTopRight.y);
        ctx.lineTo(plyBottomRight.x, plyBottomRight.y);
        ctx.lineTo(plyBottomLeft.x, plyBottomLeft.y);
        ctx.closePath();
        ctx.stroke();
      }

      // Singles 코트 라인 (항상 표시)
      const singlesRatio = COURT_REAL.WIDTH_SINGLES / COURT_REAL.WIDTH_DOUBLES;
      const sOppTopLeft = {
        x: centerX - (COURT.OPPONENT_WIDTH_TOP / 2) * singlesRatio,
        y: COURT.OPPONENT_TOP_Y
      };
      const sOppTopRight = {
        x: centerX + (COURT.OPPONENT_WIDTH_TOP / 2) * singlesRatio,
        y: COURT.OPPONENT_TOP_Y
      };
      const sOppBottomLeft = {
        x: centerX - (COURT.OPPONENT_WIDTH_BOTTOM / 2) * singlesRatio,
        y: COURT.OPPONENT_BOTTOM_Y
      };
      const sOppBottomRight = {
        x: centerX + (COURT.OPPONENT_WIDTH_BOTTOM / 2) * singlesRatio,
        y: COURT.OPPONENT_BOTTOM_Y
      };
      const sPlyTopLeft = {
        x: centerX - (COURT.PLAYER_WIDTH_TOP / 2) * singlesRatio,
        y: COURT.PLAYER_TOP_Y
      };
      const sPlyTopRight = {
        x: centerX + (COURT.PLAYER_WIDTH_TOP / 2) * singlesRatio,
        y: COURT.PLAYER_TOP_Y
      };
      const sPlyBottomLeft = {
        x: centerX - (COURT.PLAYER_WIDTH_BOTTOM / 2) * singlesRatio,
        y: COURT.PLAYER_BOTTOM_Y
      };
      const sPlyBottomRight = {
        x: centerX + (COURT.PLAYER_WIDTH_BOTTOM / 2) * singlesRatio,
        y: COURT.PLAYER_BOTTOM_Y
      };

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sOppTopLeft.x, sOppTopLeft.y);
      ctx.lineTo(sOppTopRight.x, sOppTopRight.y);
      ctx.lineTo(sPlyBottomRight.x, sPlyBottomRight.y);
      ctx.lineTo(sPlyBottomLeft.x, sPlyBottomLeft.y);
      ctx.closePath();
      ctx.stroke();


      // 중앙 네트
      const netWidth = getCourtWidthAtY(COURT.NET_Y) * widthRatio;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = COURT.NET_WIDTH;
      ctx.beginPath();
      ctx.moveTo(centerX - netWidth / 2, COURT.NET_Y);
      ctx.lineTo(centerX + netWidth / 2, COURT.NET_Y);
      ctx.stroke();

      // 서비스 라인 (상대)
      const oppServiceWidth = getCourtWidthAtY(COURT.SERVICE_LINE_Y) * singlesRatio;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - oppServiceWidth / 2, COURT.SERVICE_LINE_Y);
      ctx.lineTo(centerX + oppServiceWidth / 2, COURT.SERVICE_LINE_Y);
      ctx.stroke();

      // 서비스 라인 (플레이어)
      const plyServiceWidth = getCourtWidthAtY(COURT.PLAYER_SERVICE_Y) * singlesRatio;
      ctx.beginPath();
      ctx.moveTo(centerX - plyServiceWidth / 2, COURT.PLAYER_SERVICE_Y);
      ctx.lineTo(centerX + plyServiceWidth / 2, COURT.PLAYER_SERVICE_Y);
      ctx.stroke();

      // 상자 내부 세로 중앙 가이드
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(centerX, COURT.OPPONENT_TOP_Y);
      ctx.lineTo(centerX, COURT.PLAYER_BOTTOM_Y);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    let frameId;
    const loop = () => {
      drawCourt();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a3d1d',
        color: 'white',
        padding: '16px'
      }}
    >
      <div style={{ maxWidth: COURT.CANVAS_WIDTH, width: '100%', marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 8px' }}>사다리꼴 테니스 코트 (원근)</h2>
        <p style={{ margin: '0 0 12px', color: '#c7e3c9', fontSize: '14px' }}>
          ITF 규격 기반 원근 코트 · Doubles Court
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={COURT.CANVAS_WIDTH}
        height={COURT.CANVAS_HEIGHT}
        style={{
          width: '100%',
          maxWidth: COURT.CANVAS_WIDTH,
          background: '#0c4a1c',
          border: '2px solid #0c4a1c',
          borderRadius: '8px'
        }}
      />
    </div>
  );
};

export default TennisProSet;
