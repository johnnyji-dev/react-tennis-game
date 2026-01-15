import React, { useEffect, useRef, useState } from 'react';

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
  const ballRef = useRef({
    x: COURT.CANVAS_WIDTH / 2,
    y: COURT.NET_Y,
    z: 100,
    vx: 3,
    vy: 3,
    vz: 0,
    radius: 8,
    rotationY: 0
  });
  const [ballState, setBallState] = useState(ballRef.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const updateBall = () => {
      const prev = ballRef.current;
      let { x, y, z, vx, vy, vz, rotationY } = prev;

      // 중력
      vz -= PHYSICS.GRAVITY * COURT.SCALE * PHYSICS.DT;

      // 위치 업데이트 (높이에 따른 원근 보정)
      x += vx * (1 + z / 200);
      y += vy;
      z += vz;

      // 바닥 충돌
      if (z <= 0) {
        z = 0;
        vz *= -PHYSICS.COR_GROUND;
        vy *= 0.8;
      }

      // 네트 충돌
      if (y > COURT.NET_Y - 20 && y < COURT.NET_Y + 20 && z < COURT.NET_HEIGHT) {
        vx *= -0.7;
        vy *= -0.3;
      }

      // y 경계 (코트 앞뒤)
      if (y < COURT.OPPONENT_TOP_Y) {
        y = COURT.OPPONENT_TOP_Y;
        vy = Math.abs(vy);
      }
      if (y > COURT.PLAYER_BOTTOM_Y) {
        y = COURT.PLAYER_BOTTOM_Y;
        vy = -Math.abs(vy);
      }

      // x 경계 (사다리꼴 너비)
      const courtWidth = getCourtWidthAtY(y);
      const half = courtWidth / 2;
      const centerX = COURT.CANVAS_WIDTH / 2;
      const minX = centerX - half + prev.radius;
      const maxX = centerX + half - prev.radius;
      if (x < minX) {
        x = minX;
        vx = Math.abs(vx) * PHYSICS.COR_RACKET;
      } else if (x > maxX) {
        x = maxX;
        vx = -Math.abs(vx) * PHYSICS.COR_RACKET;
      }

      // 공기저항
      vx *= PHYSICS.AIR_RESISTANCE;
      vy *= PHYSICS.AIR_RESISTANCE;

      const next = {
        ...prev,
        x,
        y,
        z,
        vx,
        vy,
        vz,
        rotationY: (rotationY + vy * 10) % 360
      };
      ballRef.current = next;
      setBallState(next);
    };

    const drawCourt = () => {
      ctx.clearRect(0, 0, COURT.CANVAS_WIDTH, COURT.CANVAS_HEIGHT);
      ctx.fillStyle = '#0c4a1c';
      ctx.fillRect(0, 0, COURT.CANVAS_WIDTH, COURT.CANVAS_HEIGHT);

      const centerX = COURT.CANVAS_WIDTH / 2;
      const oppTopLeft = {
        x: centerX - COURT.OPPONENT_WIDTH_TOP / 2,
        y: COURT.OPPONENT_TOP_Y
      };
      const oppTopRight = { x: centerX + COURT.OPPONENT_WIDTH_TOP / 2, y: COURT.OPPONENT_TOP_Y };
      const oppBottomLeft = {
        x: centerX - COURT.OPPONENT_WIDTH_BOTTOM / 2,
        y: COURT.OPPONENT_BOTTOM_Y
      };
      const oppBottomRight = {
        x: centerX + COURT.OPPONENT_WIDTH_BOTTOM / 2,
        y: COURT.OPPONENT_BOTTOM_Y
      };

      const plyTopLeft = {
        x: centerX - COURT.PLAYER_WIDTH_TOP / 2,
        y: COURT.PLAYER_TOP_Y
      };
      const plyTopRight = { x: centerX + COURT.PLAYER_WIDTH_TOP / 2, y: COURT.PLAYER_TOP_Y };
      const plyBottomLeft = {
        x: centerX - COURT.PLAYER_WIDTH_BOTTOM / 2,
        y: COURT.PLAYER_BOTTOM_Y
      };
      const plyBottomRight = {
        x: centerX + COURT.PLAYER_WIDTH_BOTTOM / 2,
        y: COURT.PLAYER_BOTTOM_Y
      };

      // 외곽 사다리꼴 (선)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(oppTopLeft.x, oppTopLeft.y);
      ctx.lineTo(oppTopRight.x, oppTopRight.y);
      ctx.lineTo(plyBottomRight.x, plyBottomRight.y);
      ctx.lineTo(plyBottomLeft.x, plyBottomLeft.y);
      ctx.closePath();
      ctx.stroke();

      // 중앙 네트
      const netWidth = getCourtWidthAtY(COURT.NET_Y);
      ctx.lineWidth = COURT.NET_WIDTH;
      ctx.beginPath();
      ctx.moveTo(centerX - netWidth / 2, COURT.NET_Y);
      ctx.lineTo(centerX + netWidth / 2, COURT.NET_Y);
      ctx.stroke();

      // 서비스 라인 (상대)
      const oppServiceWidth = getCourtWidthAtY(COURT.SERVICE_LINE_Y);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - oppServiceWidth / 2, COURT.SERVICE_LINE_Y);
      ctx.lineTo(centerX + oppServiceWidth / 2, COURT.SERVICE_LINE_Y);
      ctx.stroke();

      // 서비스 라인 (플레이어)
      const plyServiceWidth = getCourtWidthAtY(COURT.PLAYER_SERVICE_Y);
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

    const drawBall = () => {
      const { x, y, z, radius } = ballRef.current;
      const centerX = COURT.CANVAS_WIDTH / 2;
      const screenX = x;
      const screenY = y - z * 0.6;
      const scaledR = radius * (1 + z / 200);

      // 그림자
      const shadowWidth = scaledR * 1.8;
      const shadowHeight = scaledR * 0.6;
      const shadowY = y + scaledR * 0.6;
      const shadowX = screenX;
      const shadowAlpha = Math.max(0.1, 0.6 - z / 200);
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(shadowX, shadowY, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // 공
      const grad = ctx.createRadialGradient(
        screenX - scaledR * 0.4,
        screenY - scaledR * 0.4,
        scaledR * 0.2,
        screenX,
        screenY,
        scaledR
      );
      grad.addColorStop(0, '#f6ff7a');
      grad.addColorStop(0.6, '#d4ef3f');
      grad.addColorStop(1, '#9bbc1b');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenX, screenY, scaledR, 0, Math.PI * 2);
      ctx.fill();

      // 심선
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = scaledR * 0.25;
      ctx.beginPath();
      ctx.arc(screenX, screenY, scaledR * 0.75, 0.5, Math.PI + 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(screenX, screenY, scaledR * 0.75, Math.PI + 0.5, Math.PI * 2 + 0.5);
      ctx.stroke();
    };

    let frameId;
    const loop = () => {
      updateBall();
      drawCourt();
      drawBall();
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
      <div style={{ maxWidth: COURT.CANVAS_WIDTH, width: '100%' }}>
        <h2 style={{ margin: '0 0 8px' }}>사다리꼴 테니스 코트 (원근)</h2>
        <p style={{ margin: '0 0 12px', color: '#c7e3c9', fontSize: '14px' }}>
          ITF 규격 기반 원근 코트 · 중력/반발/공기저항 물리 · 네트/서비스 라인 표시
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

      <div style={{ marginTop: '12px', fontSize: '14px', color: '#d7ffd9' }}>
        x: {ballState.x.toFixed(1)} · y: {ballState.y.toFixed(1)} · z:{' '}
        {ballState.z.toFixed(1)}
      </div>
    </div>
  );
};

export default TennisProSet;
