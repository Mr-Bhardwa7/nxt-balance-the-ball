"use client"

import { useRef, useState } from "react";
import { persistor, store } from '@/app/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react';
import { Stage, Layer, Circle, Line } from "react-konva";
import StopWatch from "@/components/stopwatch";
import type { StopWatchRef } from "@/components/stopwatch";
import type { Circle as KonvaCircle } from "konva/lib/shapes/Circle";
import GameOverModal from "@/components/models/GameOverModal";
import CompleteModal from "@/components/models/CompleteModal";
import Scoreboard from "@/components/models/Scoreboard";
import { useLeaderboardCache } from "@/utils/scoreboardhelper";
import AdBanner from "@/components/ads/AdBanner";
import houseAdsData from "@/data/houseAds";

const App = () => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const isMobile = window.innerWidth < 768;
  const innerRadius = isMobile ? 120 : 164;
  const outerRadius = isMobile ? 160 : 208;
  const ballRadius = 13;

  const startAngle = 90; // default position
  const startDist = (innerRadius + outerRadius) / 2;

  const [angle, setAngle] = useState(startAngle);
  const [completed, setCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [ballColor, setBallColor] = useState("blue");
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({
    x: centerX + startDist * Math.cos((startAngle * Math.PI) / 180),
    y: centerY + startDist * Math.sin((startAngle * Math.PI) / 180),
  });
  const [isScoreboardOpen, setScoreboardOpen] = useLeaderboardCache(!isMobile);
  const [scores, setScores] = useState([
    { name: "Alice", mobile: "1111111111", time: 45 },
    { name: "Bob", mobile: "2222222222", time: 52 },
    { name: "Charlie", mobile: "3333333333", time: 38 },
    { name: "Alice", mobile: "4444444444", time: 45 },
    { name: "Bob", mobile: "5555555555", time: 52 },
    { name: "Charlie", mobile: "6666666666", time: 38 },
    { name: "Alice", mobile: "7777777777", time: 45 },
    { name: "Bob", mobile: "8888888888", time: 52 },
    { name: "Charlie", mobile: "9999999999", time: 38 },
    { name: "Alice", mobile: "1010101010", time: 45 },
    { name: "Bob", mobile: "1212121212", time: 52 },
    { name: "Charlie", mobile: "1313131313", time: 38 },
    { name: "Alice", mobile: "1414141414", time: 45 },
    { name: "Bob", mobile: "1515151515", time: 52 },
    { name: "Charlie", mobile: "1616161616", time: 38 },
    { name: "Alice", mobile: "1717171717", time: 45 },
    { name: "Bob", mobile: "1818181818", time: 52 },
    { name: "Charlie", mobile: "1919191919", time: 38 },
  ]);
  const totalRotationRef = useRef(0);
  const prevAngleRef = useRef(startAngle);
  const ballRef = useRef<KonvaCircle>(null);
  const releaseDirectionRef = useRef(0);
  const stopwatchRef = useRef<StopWatchRef>(null);

  const getAngle = (x: number, y: number) => {
    let ang = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    if (ang < 0) ang += 360;
    return ang;
  };

  const distanceFromCenter = (x: number, y: number) =>
    Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

  const checkCollision = (dist: number, isLockedAtStart: boolean) => {
    if (isLockedAtStart) return;
    const hitInner = dist <= innerRadius + ballRadius;
    const hitOuter = dist >= outerRadius - ballRadius;

    if (hitInner || hitOuter) {
      if (completed) return;

      stopwatchRef.current?.handleStop();
      ballRef.current?.stopDrag();
      setGameOver(true);
      setTimeout(() => handleRelease(), 0);
    }
    setBallColor(hitInner || hitOuter ? "red" : "blue");
  };

  const handleRelease = () => {
    if (completed) return;

    const dist = distanceFromCenter(pos.x, pos.y);
    let currentAngleDeg = angle;

    const animate = () => {
      currentAngleDeg -= 3; // speed
      if (currentAngleDeg < 0) currentAngleDeg += 360;

      const diff = ((currentAngleDeg - startAngle + 360) % 360);
      if (diff <= 3 || diff >= 357) {
        currentAngleDeg = startAngle;
        const rad = (currentAngleDeg * Math.PI) / 180;
        setPos({
          x: centerX + dist * Math.cos(rad),
          y: centerY + dist * Math.sin(rad),
        });
        setAngle(currentAngleDeg);
        return;
      }

      const rad = (currentAngleDeg * Math.PI) / 180;
      setPos({
        x: centerX + dist * Math.cos(rad),
        y: centerY + dist * Math.sin(rad),
      });
      setAngle(currentAngleDeg);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (!stopwatchRef.current?.isActive)
      stopwatchRef.current?.handleReset()
        .then(() => {
          setCompleted(false);
          totalRotationRef.current = 0;
          prevAngleRef.current = startAngle;
          stopwatchRef.current?.handleStart();
        });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    handleRelease();
  };

  const checkFullCircle = (newAngle: number) => {
    let delta = newAngle - prevAngleRef.current;
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;

    totalRotationRef.current += delta;
    prevAngleRef.current = newAngle;

    if (Math.abs(totalRotationRef.current) >= 360) {
      stopwatchRef.current?.handleStop();
      setCompleted(true);
      ballRef.current?.stopDrag();
    }
  };

  // Magnifier Preview Component
  const MagnifierPreview = () => {
    if (!isDragging) return null;

    const magnifierSize = isMobile ? 120 : 150;
    const zoomFactor = 2.5;

    // Calculate magnifier center
    const magnifierCenterX = magnifierSize / 2;
    const magnifierCenterY = magnifierSize / 2;

    // Calculate what area to show (centered on ball position)
    const scaledInnerRadius = innerRadius * zoomFactor;
    const scaledOuterRadius = outerRadius * zoomFactor;
    const scaledBallRadius = ballRadius * zoomFactor;

    // Calculate positions relative to the ball's position
    const offsetX = (pos.x - centerX) * zoomFactor;
    const offsetY = (pos.y - centerY) * zoomFactor;
    
    const magnifierMainCenterX = magnifierCenterX - offsetX;
    const magnifierMainCenterY = magnifierCenterY - offsetY;
    const magnifierBallX = magnifierCenterX;
    const magnifierBallY = magnifierCenterY;

    // Calculate start line positions
    const startLineInnerX = magnifierMainCenterX + scaledInnerRadius * Math.cos((startAngle * Math.PI) / 180);
    const startLineInnerY = magnifierMainCenterY + scaledInnerRadius * Math.sin((startAngle * Math.PI) / 180);
    const startLineOuterX = magnifierMainCenterX + scaledOuterRadius * Math.cos((startAngle * Math.PI) / 180);
    const startLineOuterY = magnifierMainCenterY + scaledOuterRadius * Math.sin((startAngle * Math.PI) / 180);

    return (
      <div className="absolute top-4 left-4 border-2 border-white rounded-lg overflow-hidden bg-gray-800/90 backdrop-blur-sm z-20 shadow-lg">
        <Stage width={magnifierSize} height={magnifierSize}>
          <Layer>
            {/* Magnified inner circle */}
            <Circle
              x={magnifierMainCenterX}
              y={magnifierMainCenterY}
              radius={scaledInnerRadius}
              stroke="white"
              strokeWidth={2}
            />
            {/* Magnified outer circle */}
            <Circle
              x={magnifierMainCenterX}
              y={magnifierMainCenterY}
              radius={scaledOuterRadius}
              stroke="white"
              strokeWidth={2}
            />
            {/* Magnified start line */}
            <Line
              points={[
                startLineInnerX,
                startLineInnerY,
                startLineOuterX,
                startLineOuterY,
              ]}
              stroke="yellow"
              strokeWidth={2}
            />
            {/* Magnified ball */}
            <Circle
              x={magnifierBallX}
              y={magnifierBallY}
              radius={scaledBallRadius}
              fill={ballColor}
              stroke="white"
              strokeWidth={2}
            />
          </Layer>
        </Stage>
        <div className="absolute bottom-1 right-1 text-white text-xs bg-black/70 px-2 py-1 rounded">
          {zoomFactor}x
        </div>
      </div>
    );
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 relative">
        {/* Magnifier Preview - only shows when dragging */}
        <MagnifierPreview />

        {
          isMobile ? (
            <>
              <AdBanner position="bottom" houseAds={houseAdsData} />
            </>
          ) : (
            <>
              <AdBanner position="left" houseAds={houseAdsData} />
              <AdBanner position="right" houseAds={houseAdsData} />
            </>
          )
        }

        <StopWatch ref={stopwatchRef} />
        <Stage width={window.innerWidth - 20} height={window.innerHeight - 20}>
          <Layer>
            {/* Inner circle */}
            <Circle x={centerX} y={centerY} radius={innerRadius} stroke="white" strokeWidth={2} />
            {/* Outer circle */}
            <Circle x={centerX} y={centerY} radius={outerRadius} stroke="white" strokeWidth={2} />
            {/* Line */}
            <Line
              points={[
                centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180),
                centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180),
                centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180),
                centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180),
              ]}
              stroke="yellow"
              strokeWidth={2}
            />
            {/* Ball */}
            <Circle
              ref={ballRef}
              x={pos.x}
              y={pos.y}
              radius={ballRadius}
              fill={ballColor}
              stroke="white"
              strokeWidth={1}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
              draggable
              dragBoundFunc={(p) => {
                const newAngle = getAngle(p.x, p.y);
                const dist = distanceFromCenter(p.x, p.y);
                let clampedDist = Math.min(
                  Math.max(dist, innerRadius + ballRadius),
                  outerRadius - ballRadius
                );

                let forwardDiff = newAngle - angle;
                if (forwardDiff < -180) forwardDiff += 360;
                if (forwardDiff > 180) forwardDiff -= 360;
                releaseDirectionRef.current = forwardDiff > 0 ? 1 : -1;

                const isLockedAtStart =
                  angle >= startAngle && forwardDiff < 0 && newAngle < startAngle;

                checkCollision(dist, isLockedAtStart);
                checkFullCircle(newAngle);

                if (isLockedAtStart) {
                  return {
                    x: centerX + startDist * Math.cos((startAngle * Math.PI) / 180),
                    y: centerY + startDist * Math.sin((startAngle * Math.PI) / 180),
                  };
                }

                setAngle(newAngle);
                const newX = centerX + clampedDist * Math.cos((newAngle * Math.PI) / 180);
                const newY = centerY + clampedDist * Math.sin((newAngle * Math.PI) / 180);
                setPos({ x: newX, y: newY });

                return { x: newX, y: newY };
              }}
            />
          </Layer>
        </Stage>

        <GameOverModal
          open={gameOver}
          onRestart={() => window.location.reload()}
          onClose={() => setGameOver(false)}
        />
        <CompleteModal
          open={completed}
          onRestart={() => window.location.reload()}
          onClose={() => setCompleted(false)}
        />
     

        <Scoreboard
          scores={scores}
          isOpen={isScoreboardOpen}
          onToggle={() => setScoreboardOpen((prev) => !prev)}
          currentUser={{
              mobile: "1515151515",
              name: "You"
            }}
            
        />
        </div>
        </PersistGate>
    </Provider>
  );
};

export default App;