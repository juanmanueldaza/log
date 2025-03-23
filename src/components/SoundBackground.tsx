import React, { useEffect, useRef } from "react";
import p5 from "p5";

const SoundBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let p5Instance: p5;
    let analyser: AnalyserNode | null = null;
    let audioContext: AudioContext | null = null;
    let audioInitialized = false;

    const initAudio = async () => {
      if (audioInitialized) return;
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioInitialized = true;
      } catch (err) {
        console.log('Audio error:', err);
      }
    };

    // Crear instancia de p5 después de que el DOM esté listo
    if (containerRef.current) {
      p5Instance = new p5((p: p5) => {
        p.setup = () => {
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
          if (containerRef.current) {
            canvas.parent(containerRef.current);
          }
          p.background(0);
          document.addEventListener('click', initAudio);
        };

        p.draw = () => {
          p.background(0, 20);
          p.stroke(255);

          if (analyser) {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            const spacing = p.width / 50;
            for (let i = 0; i < 50; i++) {
              const x = i * spacing;
              const freqIndex = Math.floor(i * (dataArray.length / 50));
              const amplitude = p.map(dataArray[freqIndex], 0, 255, 0, p.height / 3);
              p.line(x, p.height / 2 - amplitude, x, p.height / 2 + amplitude);
            }
          } else {
            const t = p.frameCount * 0.05;
            for (let i = 0; i < 50; i++) {
              const x = (p.width / 50) * i;
              const amplitude = p.sin(t + i * 0.3) * 100;
              p.line(x, p.height / 2 - amplitude, x, p.height / 2 + amplitude);
            }
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
      }, containerRef.current);
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

export default SoundBackground;