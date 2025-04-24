"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";

import type { IAudioWaveformProps } from "./props.types";

// Global store for audio nodes to prevent multiple connections
interface AudioNodes {
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
  dataArray: Uint8Array;
}

const audioNodesStore: Record<string, AudioNodes> = {};
let globalAudioContext: AudioContext | null = null;

export function AudioWaveform({
  audioId,
  isPlaying,
  color = "#0ea5e9",
  backgroundColor = "transparent",
  height = 40,
  onSeek,
}: IAudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get or create the global audio context
    if (!globalAudioContext) {
      globalAudioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audio = document.getElementById(audioId) as HTMLAudioElement;
    if (!audio) return;

    // Set up time update listener
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleTimeUpdate);

    // Check if we already have nodes for this audio element
    if (!audioNodesStore[audioId]) {
      try {
        // Create analyzer
        const analyser = globalAudioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Create source only if it doesn't exist
        const source = globalAudioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(globalAudioContext.destination);

        // Store nodes globally
        audioNodesStore[audioId] = {
          source,
          analyser,
          dataArray,
        };
      } catch (error) {
        console.error("Error setting up audio analyzer:", error);
      }
    }

    setIsInitialized(true);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);

      // We don't clean up the audio nodes on unmount because they might be used by other components
      // The browser will clean them up when the page is unloaded

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioId]);

  // Handle seeking when clicking on the waveform
  const handleSeek = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const audio = document.getElementById(audioId) as HTMLAudioElement;
      if (!audio || !containerRef.current || !duration) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clickPosition = event.clientX - rect.left;
      const percentage = clickPosition / rect.width;
      const seekTime = percentage * duration;

      // Update audio time
      audio.currentTime = seekTime;

      // Call onSeek callback if provided
      if (onSeek) {
        onSeek(seekTime);
      }
    },
    [audioId, duration, onSeek]
  );

  // Handle mouse movement for hover effect
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const hoverPos = event.clientX - rect.left;
      setHoverPosition(hoverPos);
    },
    []
  );

  // Draw waveform animation
  useEffect(() => {
    if (!isInitialized || !canvasRef.current) return;

    const nodes = audioNodesStore[audioId];
    if (!nodes) return;

    const { analyser, dataArray } = nodes;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Make canvas responsive
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      if (!ctx) return;

      // Get canvas dimensions
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background if not transparent
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Calculate bar width and spacing
      const barCount = Math.min(128, dataArray.length / 2); // Limit number of bars for performance
      const barWidth = width / barCount;
      const barSpacing = barWidth * 0.2;
      const actualBarWidth = barWidth - barSpacing;

      // Draw bars
      ctx.fillStyle = color;

      for (let i = 0; i < barCount; i++) {
        // Use mirrored bars for symmetry
        const barHeight = (dataArray[i] / 255) * height * 0.8; // 80% of height max

        // Left side (mirrored)
        const x1 = (barCount - i - 1) * barWidth;
        ctx.fillRect(x1, height - barHeight, actualBarWidth, barHeight);

        // Right side
        const x2 = barCount * barWidth + i * barWidth;
        ctx.fillRect(x2, height - barHeight, actualBarWidth, barHeight);
      }

      // Draw playback position indicator
      if (duration > 0) {
        const positionX = (currentTime / duration) * width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, positionX, height);

        // Draw position line
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(positionX, 0);
        ctx.lineTo(positionX, height);
        ctx.stroke();
      }

      // Draw hover position indicator if hovering
      if (isHovering) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hoverPosition, 0);
        ctx.lineTo(hoverPosition, height);
        ctx.stroke();
      }

      // Continue animation if playing
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    // Start or stop animation based on isPlaying
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Draw static waveform when paused
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw some static bars when paused
      ctx.fillStyle = color;
      const barCount = 40;
      const barWidth = canvas.width / barCount;
      const barSpacing = barWidth * 0.2;
      const actualBarWidth = barWidth - barSpacing;

      for (let i = 0; i < barCount; i++) {
        // Generate a random but consistent height based on position
        const randomHeight = Math.sin(i * 0.5) * 0.5 + 0.2;
        const barHeight = randomHeight * canvas.height * 0.8;
        ctx.fillRect(
          i * barWidth,
          canvas.height - barHeight,
          actualBarWidth,
          barHeight
        );
      }

      // Draw playback position indicator
      if (duration > 0) {
        const positionX = (currentTime / duration) * canvas.width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, positionX, canvas.height);

        // Draw position line
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(positionX, 0);
        ctx.lineTo(positionX, canvas.height);
        ctx.stroke();
      }

      // Draw hover position indicator if hovering
      if (isHovering) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hoverPosition, 0);
        ctx.lineTo(hoverPosition, canvas.height);
        ctx.stroke();
      }
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    isPlaying,
    color,
    backgroundColor,
    height,
    isInitialized,
    currentTime,
    duration,
    isHovering,
    hoverPosition,
    audioId,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-pointer"
      onClick={handleSeek}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <canvas
        ref={canvasRef}
        width="100%"
        height="100%"
        className="w-full h-full"
      />
    </div>
  );
}
