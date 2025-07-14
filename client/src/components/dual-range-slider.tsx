import { useEffect, useRef, useState } from "react";

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
    
    if (maxValue <= min + step) {
      maxSliderRef.current.style.zIndex = "2";
    } else {
      maxSliderRef.current.style.zIndex = "1";
    }
  };

  useEffect(() => {
    fillSlider();
    setToggleAccessible();
  }, [minValue, maxValue, min, max, step]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value < maxValue) {
      onMinChange(value);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > minValue) {
      onMaxChange(value);
    }
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
        className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                   [&::-webkit-slider-thumb]:appearance-none 
                   [&::-webkit-slider-thumb]:w-5 
                   [&::-webkit-slider-thumb]:h-5 
                   [&::-webkit-slider-thumb]:rounded-full 
                   [&::-webkit-slider-thumb]:bg-white 
                   [&::-webkit-slider-thumb]:border-2 
                   [&::-webkit-slider-thumb]:border-pink-300 
                   [&::-webkit-slider-thumb]:shadow-lg 
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-all
                   [&::-webkit-slider-thumb]:duration-200
                   [&::-webkit-slider-thumb]:hover:scale-110
                   [&::-webkit-slider-thumb]:hover:shadow-xl
                   [&::-moz-range-thumb]:appearance-none
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-2
                   [&::-moz-range-thumb]:border-pink-300
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:transition-all
                   [&::-moz-range-thumb]:duration-200
                   [&::-moz-range-track]:bg-transparent"
      />
      
      <input
        ref={maxSliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                   [&::-webkit-slider-thumb]:appearance-none 
                   [&::-webkit-slider-thumb]:w-5 
                   [&::-webkit-slider-thumb]:h-5 
                   [&::-webkit-slider-thumb]:rounded-full 
                   [&::-webkit-slider-thumb]:bg-white 
                   [&::-webkit-slider-thumb]:border-2 
                   [&::-webkit-slider-thumb]:border-pink-300 
                   [&::-webkit-slider-thumb]:shadow-lg 
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-all
                   [&::-webkit-slider-thumb]:duration-200
                   [&::-webkit-slider-thumb]:hover:scale-110
                   [&::-webkit-slider-thumb]:hover:shadow-xl
                   [&::-moz-range-thumb]:appearance-none
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-2
                   [&::-moz-range-thumb]:border-pink-300
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:transition-all
                   [&::-moz-range-thumb]:duration-200
                   [&::-moz-range-track]:bg-transparent"
      />
    </div>
  );
}