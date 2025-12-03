import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

interface TimerProps {
  time: number; 
}

export interface StopWatchRef {
  isActive: boolean;
  isPaused: boolean;
  handleStart: () => void;
  handlePauseResume: () => void;
  handleReset: () => Promise<void>;
  handleStop: () => void;
}

function FlipDigit({ value, size }: { value: string; size?: "sm" | "base" }) {
  const baseSize =
    size === "sm"
      ? { width: "w-6 xs:w-7 sm:w-8", height: "h-8 xs:h-9 sm:h-10", text: "text-lg xs:text-xl sm:text-xl" }
      : { width: "w-8 xs:w-9 sm:w-10", height: "h-12 xs:h-13 sm:h-14", text: "text-xl xs:text-2xl sm:text-2xl" };

  const [prevValue, setPrevValue] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setFlipping(true);
      const timeout = setTimeout(() => {
        setFlipping(false);
        setPrevValue(value);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [value, prevValue]);

  return (
    <div className={`relative ${baseSize.width} ${baseSize.height} perspective-500`}>
      <div
        className={`absolute inset-0 bg-gray-900 text-white flex items-center justify-center ${baseSize.text} font-mono rounded-t-md overflow-hidden ${
          flipping ? "animate-flip-top" : ""
        }`}
      >
        {prevValue}
      </div>
      <div
        className={`absolute inset-0 bg-gray-800 text-white flex items-center justify-center ${baseSize.text} font-mono rounded-b-md overflow-hidden ${
          flipping ? "animate-flip-bottom" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}



function Timer({ time }: TimerProps) {
  const minutes = ("0" + Math.floor((time / 60000) % 60)).slice(-2);
  const seconds = ("0" + Math.floor((time / 1000) % 60)).slice(-2);
  const milliseconds = ("0" + Math.floor((time / 10) % 100)).slice(-2);

  return (
    <div
      className="
        flex flex-wrap items-center
        gap-[0.1rem] sm:gap-[0.25rem]
        max-w-[95vw]
      "
    >
      {/* Minutes */}
      {minutes.split("").map((digit, i) => (
        <FlipDigit key={`m-${i}`} value={digit} size="sm" />
      ))}

      <span className="text-lg sm:text-2xl font-mono text-white">:</span>

      {/* Seconds */}
      {seconds.split("").map((digit, i) => (
        <FlipDigit key={`s-${i}`} value={digit} size="sm" />
      ))}

      <span className="text-lg sm:text-2xl font-mono text-white">.</span>

      {/* Milliseconds - smaller */}
      {milliseconds.split("").map((digit, i) => (
        <FlipDigit key={`ms-${i}`} value={digit} size="sm" />
      ))}
    </div>
  );
}

const StopWatch = forwardRef<StopWatchRef>((_, ref) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => setTime((t) => t + 10), 10);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };
  const handlePauseResume = () => setIsPaused((prev) => !prev);
  const handleReset = (): Promise<void> => {
    return new Promise((resolve) => {
      setIsActive(false);
      setTime(0);
      setTimeout(resolve, 0);
    });
  };
  const handleStop = () => {
    setIsActive(false);
    setIsPaused(true);
  };

  useImperativeHandle(ref, () => ({
    isActive,
    isPaused,
    handleStart,
    handlePauseResume,
    handleReset,
    handleStop,
  }));

  return (
    <div
      className="
        fixed top-2 left-2
        origin-top-left
        scale-[clamp(0.5,2.5vw,1)]
      "
    >
      <Timer time={time} />
    </div>
  );
});

export default StopWatch;