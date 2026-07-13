import React, { useState, useEffect, useRef } from 'react';
import { StylePreset } from '../types';
import { 
  CloudRain, Flame, Wind, Disc, Bird, Music, Play, Square, 
  Volume2, VolumeX, Sparkles, RefreshCw, ExternalLink, Info, 
  Headphones, Music4, ArrowLeftRight
} from 'lucide-react';

interface AmbientMoodProps {
  selectedStyle: StylePreset;
}

interface SoundscapeMix {
  rain: number;
  fireplace: number;
  wind: number;
  crackle: number;
  birds: number;
  piano: number; // Synth Pad
  synth: number; // Lofi Synth
  cafe: number;  // Coffee Shop chatter
}

export default function AmbientMood({ selectedStyle }: AmbientMoodProps) {
  // Mode Selection: 'synth' (live Web Audio synth) or 'spotify' (Spotify Playlist Embed)
  const [activeMode, setActiveMode] = useState<'synth' | 'spotify'>('synth');
  
  // Custom Mood Prompt & Loading States
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Soundscape Data from Server / Fallbacks
  const [moodTitle, setMoodTitle] = useState<string>('');
  const [moodDescription, setMoodDescription] = useState<string>('');
  const [spotifyPlaylistId, setSpotifyPlaylistId] = useState<string>('37i9dQZF1DX4sWSpwq3LiO');
  const [recommendedTracks, setRecommendedTracks] = useState<any[]>([]);
  const [mix, setMix] = useState<SoundscapeMix>({
    rain: 50,
    fireplace: 30,
    wind: 20,
    crackle: 10,
    birds: 20,
    piano: 60,
    synth: 30,
    cafe: 0
  });

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Web Audio Context & Synthesizer Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);
  
  // Channel Gain Nodes
  const gainNodesRef = useRef<Record<string, GainNode>>({});
  // Source Nodes to Stop them
  const activeSourcesRef = useRef<any[]>([]);
  // Sequencer interval / timer
  const synthTimerRef = useRef<any>(null);

  // Fetch mood analysis from backend
  const generateMood = async (useCustomPrompt = false) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          styleId: selectedStyle.id,
          styleName: selectedStyle.name,
          customPrompt: useCustomPrompt ? customPrompt : undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMoodTitle(data.title);
          setMoodDescription(data.description);
          setSpotifyPlaylistId(data.playlistId);
          setRecommendedTracks(data.recommendedTracks || []);
          
          if (data.soundscape) {
            setMix({
              rain: data.soundscape.rain ?? 30,
              fireplace: data.soundscape.fireplace ?? 20,
              wind: data.soundscape.wind ?? 20,
              crackle: data.soundscape.crackle ?? 10,
              birds: data.soundscape.birds ?? 20,
              piano: data.soundscape.piano ?? 50,
              synth: data.soundscape.synth ?? 30,
              cafe: data.soundscape.cafe ?? 0
            });
          }
        }
      }
    } catch (err) {
      console.error("Error generating soundscape mood:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate on Style change
  useEffect(() => {
    generateMood(false);
    setCustomPrompt('');
    
    // Stop audio when style changes so they can play the new style-specific one
    if (isPlaying) {
      stopAudio();
    }
  }, [selectedStyle]);

  // Handle mix levels updating live gains
  useEffect(() => {
    Object.keys(mix).forEach((channel) => {
      const node = gainNodesRef.current[channel];
      if (node && audioCtxRef.current) {
        const value = mix[channel as keyof SoundscapeMix] / 100;
        node.gain.setTargetAtTime(value, audioCtxRef.current.currentTime, 0.1);
      }
    });
  }, [mix]);

  // Master Volume Live updates
  useEffect(() => {
    const node = masterGainNodeRef.current;
    if (node && audioCtxRef.current) {
      const targetVol = isMuted ? 0 : masterVolume;
      node.gain.setTargetAtTime(targetVol, audioCtxRef.current.currentTime, 0.1);
    }
  }, [masterVolume, isMuted]);

  // Web Audio Synth Engine Initialization
  const startAudio = async () => {
    try {
      if (isPlaying) return;

      // Create AudioContext if not exists
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainNodeRef.current = masterGain;

      // 1. Create a White Noise Buffer
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // Helper to spawn a noise channel
      const createNoiseChannel = (name: string, filterConfig?: { type: BiquadFilterType; frequency: number }) => {
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const channelGain = ctx.createGain();
        const value = mix[name as keyof SoundscapeMix] / 100;
        channelGain.gain.setValueAtTime(value, ctx.currentTime);
        gainNodesRef.current[name] = channelGain;

        if (filterConfig) {
          const filter = ctx.createBiquadFilter();
          filter.type = filterConfig.type;
          filter.frequency.setValueAtTime(filterConfig.frequency, ctx.currentTime);
          
          source.connect(filter);
          filter.connect(channelGain);
        } else {
          source.connect(channelGain);
        }

        channelGain.connect(masterGain);
        source.start();
        activeSourcesRef.current.push(source);
      };

      // Spawn Channels
      // Rain: Lowpass White Noise
      createNoiseChannel('rain', { type: 'lowpass', frequency: 750 });

      // Fireplace: Bandpassed White Noise + Crackle generator
      createNoiseChannel('fireplace', { type: 'bandpass', frequency: 280 });

      // Ocean Wind: White noise + Lowpass modulated by a slow LFO
      const windSource = ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(300, ctx.currentTime);
      windFilter.Q.setValueAtTime(3.0, ctx.currentTime);

      const windLFO = ctx.createOscillator();
      windLFO.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow 12-second cycle

      const windLFOGain = ctx.createGain();
      windLFOGain.gain.setValueAtTime(150, ctx.currentTime); // oscillate by 150Hz

      windLFO.connect(windLFOGain);
      windLFOGain.connect(windFilter.frequency); // modulate wind cut-off

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(mix.wind / 100, ctx.currentTime);
      gainNodesRef.current['wind'] = windGain;

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      windLFO.start();
      windSource.start();
      activeSourcesRef.current.push(windSource);
      activeSourcesRef.current.push(windLFO);

      // Vinyl Crackle: High-passed white noise with click impulses
      createNoiseChannel('crackle', { type: 'highpass', frequency: 7000 });

      // Spontaneous Wood Crackles / Vinyl clicks generator
      const triggerCrackle = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const fireplaceVol = mix.fireplace / 100;
        const crackleVol = mix.crackle / 100;
        if (fireplaceVol < 0.05 && crackleVol < 0.05) return;

        const currentCtx = audioCtxRef.current;
        const osc = currentCtx.createOscillator();
        const oscGain = currentCtx.createGain();

        // High frequency click burst
        osc.type = Math.random() > 0.4 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 4000, currentCtx.currentTime);

        const intensity = (fireplaceVol * 0.4) + (crackleVol * 0.6);
        oscGain.gain.setValueAtTime(0.001, currentCtx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.04 * intensity * Math.random(), currentCtx.currentTime + 0.002);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, currentCtx.currentTime + 0.015 + Math.random() * 0.03);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        osc.stop(currentCtx.currentTime + 0.1);
      };

      // Lofi Cafe Chatter Simulator: Bandpassed low frequency rumbling
      const cafeSource = ctx.createBufferSource();
      cafeSource.buffer = noiseBuffer;
      cafeSource.loop = true;
      const cafeFilter = ctx.createBiquadFilter();
      cafeFilter.type = 'bandpass';
      cafeFilter.frequency.setValueAtTime(250, ctx.currentTime);
      cafeFilter.Q.setValueAtTime(0.7, ctx.currentTime);
      const cafeGain = ctx.createGain();
      cafeGain.gain.setValueAtTime(mix.cafe / 100, ctx.currentTime);
      gainNodesRef.current['cafe'] = cafeGain;

      cafeSource.connect(cafeFilter);
      cafeFilter.connect(cafeGain);
      cafeGain.connect(masterGain);
      cafeSource.start();
      activeSourcesRef.current.push(cafeSource);

      // 2. Dreaming Musical Pad Synth Sequencer
      // Plays a gorgeous soothing ambient cycle of notes
      const notes = [
        [130.81, 164.81, 196.00, 246.94], // Cmaj7 notes: C3, E3, G3, B3
        [146.83, 174.61, 220.00, 261.63], // Dm7 notes: D3, F3, A3, C4
        [174.61, 220.00, 261.63, 329.63], // Fmaj7 notes: F3, A3, C4, E4
        [196.00, 246.94, 293.66, 392.00]  // G6 notes: G3, B3, D4, G4
      ];

      let chordIndex = 0;
      const playNextChord = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const padVol = mix.piano / 100;
        const synthVol = mix.synth / 100;
        if (padVol < 0.05 && synthVol < 0.05) return;

        const currentCtx = audioCtxRef.current;
        const currentNotes = notes[chordIndex];
        chordIndex = (chordIndex + 1) % notes.length;

        // Spread note trigger slightly for arpeggiation feel
        currentNotes.forEach((freq, noteIdx) => {
          const oscPad = currentCtx.createOscillator();
          const oscSynth = currentCtx.createOscillator();
          const oscGain = currentCtx.createGain();

          oscPad.type = 'sine';
          oscPad.frequency.setValueAtTime(freq, currentCtx.currentTime);

          oscSynth.type = 'triangle';
          oscSynth.frequency.setValueAtTime(freq * 2, currentCtx.currentTime); // octave higher

          // Filters to keep it soft and warm
          const synthFilter = currentCtx.createBiquadFilter();
          synthFilter.type = 'lowpass';
          synthFilter.frequency.setValueAtTime(450, currentCtx.currentTime);

          const startTime = currentCtx.currentTime + (noteIdx * 0.15);
          const attack = 1.5;
          const sustain = 3.5;
          const release = 2.0;

          const activeVolume = (padVol * 0.3) + (synthVol * 0.2);

          oscGain.gain.setValueAtTime(0.0001, startTime);
          oscGain.gain.linearRampToValueAtTime(activeVolume * 0.15, startTime + attack);
          oscGain.gain.setValueAtTime(activeVolume * 0.15, startTime + attack + sustain);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + sustain + release);

          oscPad.connect(oscGain);
          oscSynth.connect(synthFilter);
          synthFilter.connect(oscGain);
          
          oscGain.connect(masterGain);

          oscPad.start(startTime);
          oscSynth.start(startTime);
          
          oscPad.stop(startTime + attack + sustain + release + 0.1);
          oscSynth.stop(startTime + attack + sustain + release + 0.1);
        });
      };

      // Spontaneous Birds/Wind Chimes synth
      const triggerBirds = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const birdsVol = mix.birds / 100;
        if (birdsVol < 0.05) return;

        const currentCtx = audioCtxRef.current;
        const osc = currentCtx.createOscillator();
        const oscGain = currentCtx.createGain();

        osc.type = 'sine';
        // Random chirping sweeps
        const startFreq = 2200 + Math.random() * 800;
        osc.frequency.setValueAtTime(startFreq, currentCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 600, currentCtx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(startFreq - 300, currentCtx.currentTime + 0.25);

        oscGain.gain.setValueAtTime(0.0001, currentCtx.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.015 * birdsVol, currentCtx.currentTime + 0.05);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, currentCtx.currentTime + 0.28);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        osc.stop(currentCtx.currentTime + 0.3);
      };

      // Sequencer loops
      playNextChord(); // Play first chord immediately
      
      let counter = 0;
      synthTimerRef.current = setInterval(() => {
        counter++;
        
        // Chords every 7.5 seconds
        if (counter % 15 === 0) {
          playNextChord();
        }

        // Random fireplace crackles
        if (Math.random() > 0.4) {
          triggerCrackle();
          if (Math.random() > 0.7) triggerCrackle();
        }

        // Random bird chirps (every 4-6 seconds)
        if (counter % 10 === 0 && Math.random() > 0.5) {
          triggerBirds();
        }
      }, 500); // tick every 500ms

      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to start Web Audio Synthesizer:", err);
    }
  };

  const stopAudio = () => {
    // Clear sequencer loop
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }

    // Stop all audio source nodes
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];

    // Close / Suspend AudioContext
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }

    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="bg-[#16171a] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5 text-right animate-fade-in" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Headphones className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-sans">
              סאונדסקייפ ואווירה היקפית AI
            </h3>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">סנכרון סאונד מותאם אישית לסגנון {selectedStyle.name}</p>
          </div>
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex bg-black/40 border border-white/5 p-0.5 rounded-lg">
          <button
            onClick={() => setActiveMode('synth')}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer font-sans ${
              activeMode === 'synth' 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            סינתיסייזר חי 🎹
          </button>
          <button
            onClick={() => setActiveMode('spotify')}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer font-sans ${
              activeMode === 'spotify' 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            פלייליסט Spotify 🎵
          </button>
        </div>
      </div>

      {/* Description Box */}
      <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2 relative">
        <div className="flex items-center justify-between flex-row-reverse">
          <h4 className="text-xs font-extrabold text-white font-sans flex items-center gap-1.5 justify-start">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {moodTitle || "מעבד צלילי אווירה..."}
          </h4>
          {isGenerating && (
            <span className="text-[9px] text-amber-400 animate-pulse flex items-center gap-1 font-sans">
              <RefreshCw className="w-3 h-3 animate-spin" /> מחשב קצב ותדרים...
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-300 font-sans leading-relaxed">
          {moodDescription || "מנתח את קווי העיצוב על מנת לייצר פרופיל אקוסטי מושלם להפחתת מתח וריכוז מקסימלי..."}
        </p>
      </div>

      {/* Mode 1: Pure Synth Interface */}
      {activeMode === 'synth' ? (
        <div className="space-y-4">
          
          {/* Main Playback Controller Bar */}
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25' 
                    : 'bg-amber-500 text-black hover:bg-amber-600 shadow-lg shadow-amber-500/25'
                }`}
                title={isPlaying ? "הפסק סאונדסקייפ" : "נגן סאונדסקייפ"}
              >
                {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>

              {/* Dancing Waves Visualizer when audio playing */}
              {isPlaying && (
                <div className="flex items-center gap-1 h-5 pl-1">
                  {[...Array(6)].map((_, i) => (
                    <span 
                      key={i} 
                      className="w-0.75 bg-amber-500 rounded-full animate-pulse"
                      style={{ 
                        height: `${30 + Math.random() * 70}%`, 
                        animationDuration: `${0.6 + i * 0.1}s` 
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Master Volume Slider */}
            <div className="flex items-center gap-2 max-w-xs flex-1 justify-end">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                {isMuted || masterVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-500" />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => {
                  setMasterVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-24 accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                title="עוצמת שמע ראשית"
              />
            </div>
          </div>

          {/* Individual Sliders Grid */}
          <div className="bg-[#101114] p-3 rounded-xl border border-white/5 space-y-3">
            <span className="text-[10px] font-bold text-gray-400 block font-sans">מיקסר תדרים הנדסי (עריכה חיה):</span>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Rain Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-blue-400 ml-1" />גשם רך</span>
                  <span>{mix.rain}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.rain}
                  onChange={(e) => setMix(prev => ({ ...prev, rain: Number(e.target.value) }))}
                  className="w-full accent-blue-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Fireplace Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400 ml-1" />קמין עצים</span>
                  <span>{mix.fireplace}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.fireplace}
                  onChange={(e) => setMix(prev => ({ ...prev, fireplace: Number(e.target.value) }))}
                  className="w-full accent-orange-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Wind Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-teal-400 ml-1" />רוח קלה</span>
                  <span>{mix.wind}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.wind}
                  onChange={(e) => setMix(prev => ({ ...prev, wind: Number(e.target.value) }))}
                  className="w-full accent-teal-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Crackle Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><Disc className="w-3.5 h-3.5 text-amber-500 ml-1" />ויניל רטרו</span>
                  <span>{mix.crackle}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.crackle}
                  onChange={(e) => setMix(prev => ({ ...prev, crackle: Number(e.target.value) }))}
                  className="w-full accent-amber-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Birds Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><Bird className="w-3.5 h-3.5 text-emerald-400 ml-1" />ציוץ ציפורים</span>
                  <span>{mix.birds}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.birds}
                  onChange={(e) => setMix(prev => ({ ...prev, birds: Number(e.target.value) }))}
                  className="w-full accent-emerald-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Pad Synth Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5 text-purple-400 ml-1" />אמביינט פד</span>
                  <span>{mix.piano}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.piano}
                  onChange={(e) => setMix(prev => ({ ...prev, piano: Number(e.target.value) }))}
                  className="w-full accent-purple-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Lofi Synth Slider */}
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><Music4 className="w-3.5 h-3.5 text-pink-400 ml-1" />סינתי עמוק</span>
                  <span>{mix.synth}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.synth}
                  onChange={(e) => setMix(prev => ({ ...prev, synth: Number(e.target.value) }))}
                  className="w-full accent-pink-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Coffee Shop Slider */}
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans flex-row-reverse">
                  <span className="flex items-center gap-1"><ArrowLeftRight className="w-3.5 h-3.5 text-yellow-400 ml-1" />בית קפה אורבני</span>
                  <span>{mix.cafe}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={mix.cafe}
                  onChange={(e) => setMix(prev => ({ ...prev, cafe: Number(e.target.value) }))}
                  className="w-full accent-yellow-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Recommended Real Music Tracks List */}
          {recommendedTracks.length > 0 && (
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 block font-sans">רצועות מומלצות לשילוב:</span>
              <div className="space-y-1.5">
                {recommendedTracks.map((track, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] bg-[#1a1b1e]/50 py-1.5 px-2.5 rounded-lg border border-white/5 font-sans">
                    <span className="text-amber-400 font-bold">{track.title}</span>
                    <span className="text-gray-400 font-medium">מאת: {track.artist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Mood Analyzer Input Prompt (Powered by Gemini) */}
          <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-2.5">
            <label className="block text-[10px] font-bold text-gray-400 font-sans text-right">
              התאמה אישית של סאונדסקייפ בעזרת AI
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder="לדוגמה: גשם זלעפות מכה על הגג בטוקיו בלילה, סאונד חלש של רכבת ברקע..."
                className="flex-1 bg-[#131417] border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-sans"
              />
              <button
                onClick={() => generateMood(true)}
                disabled={isGenerating || !customPrompt}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-white/5 text-black disabled:text-gray-500 font-bold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all border-none font-sans"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    סנכרן
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Mode 2: Spotify Iframe Embed Player
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <iframe 
              src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`} 
              width="100%" 
              height="300" 
              frameBorder="0" 
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              className="rounded-xl"
            />
          </div>

          <div className="p-3 bg-[#101114] rounded-xl border border-white/5 flex items-center justify-between text-[10px] text-gray-400 font-sans">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              חיבור ישיר לנגן הרשת של Spotify
            </span>
            <a 
              href={`https://open.spotify.com/playlist/${spotifyPlaylistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold underline cursor-pointer"
            >
              פתח באפליקציה <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
