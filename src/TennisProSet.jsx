import React, { useRef, useEffect, useState } from 'react';

const TennisProSet = () => {
  const canvasRef = useRef(null);

  // 포인트 스코어 (0, 1, 2, 3, 4...)
  const [points, setPoints] = useState({ player: 0, computer: 0 });
  // 게임 스코어 (0 ~ 6)
  const [games, setGames] = useState({ player: 0, computer: 0 });
  const [gameState, setGameState] = useState('SERVE'); // SERVE, PLAYING, SET_OVER

  // 테니스 포인트 텍스트 변환 (듀스 로직 포함)
  const getPointLabel = (p, opponentP) => {
    if (p >= 3 && opponentP >= 3) {
      if (p === opponentP) return '40 (D)';
      if (p > opponentP) return 'Adv';
      return '40';
    }
    const labels = ['0', '15', '30', '40'];
    return labels[p] || '0';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const PADDLE_HEIGHT = 100;
    const PADDLE_WIDTH = 12;
    const BALL_RADIUS = 8;

    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
    let computerY = (canvas.height - PADDLE_HEIGHT) / 2;
    let isInServe = true;

    const startServe = () => {
      isInServe = true;
      ballY = playerY + PADDLE_HEIGHT / 2;
      ballX = PADDLE_WIDTH + BALL_RADIUS + 5;
      ballSpeedX = 0;
      ballSpeedY = 0;
      setGameState('SERVE');
    };

    const scorePoint = winner => {
      setPoints(prev => {
        const nextPoints = { ...prev, [winner]: prev[winner] + 1 };
        const opponent = winner === 'player' ? 'computer' : 'player';

        // 게임 승리 조건: 4점 이상이며 상대와 2점 차이
        if (nextPoints[winner] >= 4 && nextPoints[winner] - nextPoints[opponent] >= 2) {
          winGame(winner);
          return { player: 0, computer: 0 };
        }
        startServe();
        return nextPoints;
      });
    };

    const winGame = winner => {
      setGames(prev => {
        const nextGames = { ...prev, [winner]: prev[winner] + 1 };
        if (nextGames[winner] >= 6) {
          setGameState('SET_OVER');
        } else {
          startServe();
        }
        return nextGames;
      });
    };

    const update = () => {
      if (isInServe || gameState === 'SET_OVER') {
        if (isInServe) ballY = playerY + PADDLE_HEIGHT / 2;
        return;
      }

      ballX += ballSpeedX;
      ballY += ballSpeedY;

      if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > canvas.height) ballSpeedY = -ballSpeedY;

      // 간단한 AI 이동
      const cpuSpeed = 4.8;
      const cpuCenter = computerY + PADDLE_HEIGHT / 2;
      if (cpuCenter < ballY - 15) computerY += cpuSpeed;
      else if (cpuCenter > ballY + 15) computerY -= cpuSpeed;

      // 플레이어 패들 충돌
      if (ballX - BALL_RADIUS < PADDLE_WIDTH) {
        if (ballY > playerY && ballY < playerY + PADDLE_HEIGHT) {
          ballSpeedX = Math.abs(ballSpeedX) * 1.05;
          ballSpeedY = (ballY - (playerY + PADDLE_HEIGHT / 2)) * 0.35;
        } else if (ballX < 0) {
          scorePoint('computer');
        }
      }

      // 컴퓨터 패들 충돌
      if (ballX + BALL_RADIUS > canvas.width - PADDLE_WIDTH) {
        if (ballY > computerY && ballY < computerY + PADDLE_HEIGHT) {
          ballSpeedX = -Math.abs(ballSpeedX) * 1.05;
          ballSpeedY = (ballY - (computerY + PADDLE_HEIGHT / 2)) * 0.35;
        } else if (ballX > canvas.width) {
          scorePoint('player');
        }
      }
    };

    const draw = () => {
      ctx.fillStyle = '#1b5e20'; // 진한 테니스 코트 색상
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 코트 흰색 라인
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 30);
      ctx.lineTo(canvas.width / 2, canvas.height - 30);
      ctx.stroke();

      // 패들 & 공
      ctx.fillStyle = '#fff';
      ctx.fillRect(10, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(canvas.width - PADDLE_WIDTH - 10, computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

      ctx.beginPath();
      ctx.fillStyle = '#ccff00'; // 테니스공 형광 노랑
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    };

    let frame;
    const loop = () => {
      update();
      draw();
      frame = requestAnimationFrame(loop);
    };

    const handleInput = y => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / rect.height;
      playerY = Math.max(
        0,
        Math.min(canvas.height - PADDLE_HEIGHT, (y - rect.top) * scaleY - PADDLE_HEIGHT / 2)
      );
    };

    const onMove = e => handleInput(e.clientY || (e.touches && e.touches[0].clientY));
    const onAction = () => {
      if (isInServe) {
        ballSpeedX = 7;
        ballSpeedY = (Math.random() - 0.5) * 8;
        isInServe = false;
        setGameState('PLAYING');
      }
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('mousedown', onAction);
    canvas.addEventListener('touchstart', onAction);

    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('mousedown', onAction);
      canvas.removeEventListener('touchstart', onAction);
    };
  }, [gameState]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a3d1d',
        color: 'white'
      }}
    >
      <div
        style={{
          margin: '20px',
          padding: '15px',
          backgroundColor: '#000',
          borderRadius: '8px',
          border: '2px solid #ffd700',
          minWidth: '300px'
        }}
      >
        <table style={{ width: '100%', textAlign: 'center' }}>
          <thead>
            <tr style={{ fontSize: '12px', color: '#aaa' }}>
              <th>PLAYER</th>
              <th>SET SCORE</th>
              <th>CURRENT POINT</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontSize: '24px', fontWeight: 'bold' }}>
              <td>YOU</td>
              <td style={{ color: '#ffd700' }}>{games.player}</td>
              <td>{getPointLabel(points.player, points.computer)}</td>
            </tr>
            <tr style={{ fontSize: '24px', fontWeight: 'bold' }}>
              <td>CPU</td>
              <td style={{ color: '#ffd700' }}>{games.computer}</td>
              <td>{getPointLabel(points.computer, points.player)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ width: '90%', maxWidth: '800px', backgroundColor: '#1b5e20', touchAction: 'none' }}
      />

      <div style={{ marginTop: '15px', fontSize: '18px' }}>
        {gameState === 'SERVE' && '클릭하여 서브를 시작하세요!'}
        {gameState === 'SET_OVER' &&
          `세트 종료! ${games.player > games.computer ? '당신이' : '컴퓨터가'} 최종 승리했습니다!`}
      </div>
    </div>
  );
};

export default TennisProSet;
