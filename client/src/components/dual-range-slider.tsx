import { useEffect, useRef } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  className?: string;
}

export function DualRangeSlider({
  min,
  max,
  step,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  className = ""
}: DualRangeSliderProps) {
  const minSliderRef = useRef<HTMLInputElement>(null);
  const maxSliderRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const fillSlider = () => {
    if (!trackRef.current) return;
    
    const percent1 = ((minValue - min) / (max - min)) * 100;
    const percent2 = ((maxValue - min) / (max - min)) * 100;
    
    trackRef.current.style.background = `linear-gradient(
      to right, 
      rgba(255, 255, 255, 0.2) ${percent1}%, 
      #F3DCFA ${percent1}%, 
      #FE5C2B ${percent2}%, 
      rgba(255, 255, 255, 0.2) ${percent2}%
    )`;
  };

  const setToggleAccessible = () => {
    if (!minSliderRef.current || !maxSliderRef.current) return;
    
    // Always ensure max slider is on top when handles are close
    if (Math.abs(maxValue - minValue) <= step) {
      maxSliderRef.current.style.zIndex = "2";
      minSliderRef.current.style.zIndex = "1";
    } else {
      maxSliderRef.current.style.zIndex = "1";
      minSliderRef.current.style.zIndex = "1";
    }
  };

  useEffect(() => {
    fillSlider();
    setToggleAccessible();
  }, [minValue, maxValue, min, max, step]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const newValue = Math.min(value, maxValue);
    onMinChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const newValue = Math.max(value, minValue);
    onMaxChange(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={trackRef}
        className="h-2 rounded-full bg-white/20 backdrop-blur-sm"
        style={{
          background: `linear-gradient(
            to right, 
            rgba(255, 255, 255, 0.2) ${((minValue - min) / (max - min)) * 100}%, 
            #F3DCFA ${((minValue - min) / (max - min)) * 100}%, 
            #FE5C2B ${((maxValue - min) / (max - min)) * 100}%, 
            rgba(255, 255, 255, 0.2) ${((maxValue - min) / (max - min)) * 100}%
          )`
        }}
      />
      
      <input
        ref={minSliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={handleMinChange}
        style={{ zIndex: 1 }}
        className="dual-range-slider"
      />
      
      <input
        ref={maxSliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        style={{ zIndex: 2 }}
        className="dual-range-slider"
      />
    </div>
  );
}