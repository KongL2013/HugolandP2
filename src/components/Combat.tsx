import React, { useState, useEffect, useRef } from 'react';
import { Enemy } from '../types/game';
import { Sword, Shield, Heart } from 'lucide-react';

interface CombatProps {
  enemy: Enemy;
  playerStats: {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
  };
  onAttack: (hit: boolean) => void;
  combatLog: string[];
}

export const Combat: React.FC<CombatProps> = ({ enemy, playerStats, onAttack, combatLog }) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [compassPosition, setCompassPosition] = useState(0);
  const [targetZone, setTargetZone] = useState({ start: 0, end: 20 });
  const [isMoving, setIsMoving] = useState(true);
  
  // Use refs to track animation state
  const animationRef = useRef<number>();
  const positionRef = useRef(0);
  const directionRef = useRef(1);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Generate random target zone (20% of compass width)
    const start = Math.random() * 90; // 0-80% so the 20% zone fits
    setTargetZone({ start, end: start + 20 });
    
    // Reset position and direction
    positionRef.current = 0;
    directionRef.current = 1;
    setCompassPosition(0);
  }, [enemy]);

  useEffect(() => {
    if (!isMoving) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (currentTime: number) => {
      // Initialize lastTime on first frame
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      // Calculate delta time for consistent movement speed
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Increased speed significantly for faster movement
      const speed = 1; // Increased from 0.08 to 0.4 for much faster movement
      const movement = speed * (deltaTime / 16.67); // 16.67ms = 60 FPS

      // Update position
      positionRef.current += directionRef.current * movement;
      
      // Bounce off the edges
      if (positionRef.current >= 100) {
        positionRef.current = 100;
        directionRef.current = -1;
      } else if (positionRef.current <= 0) {
        positionRef.current = 0;
        directionRef.current = 1;
      }
      
      // Update state
      setCompassPosition(positionRef.current);
      
      // Continue animation if still moving
      if (isMoving) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Reset lastTime when starting animation
    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMoving]);

  const handleAttack = () => {
    if (isAttacking) return;

    setIsAttacking(true);
    setIsMoving(false);

    // Check if attack hits (player position is within target zone)
    const hit = positionRef.current >= targetZone.start && positionRef.current <= targetZone.end;
    
    setTimeout(() => {
      onAttack(hit);
      setIsAttacking(false);
      
      // Generate new target zone for next attack
      const start = Math.random() * 80;
      setTargetZone({ start, end: start + 20 });
      
      // Reset position and restart movement
      positionRef.current = 0;
      directionRef.current = 1;
      setCompassPosition(0);
      setIsMoving(true);
    }, 500);
  };

  return (
    <div className="bg-gradient-to-br from-red-900 via-purple-900 to-black p-3 sm:p-6 rounded-lg shadow-2xl">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Combat - Zone {enemy.zone}</h2>
        <p className="text-red-300 text-base sm:text-lg font-semibold">{enemy.name}</p>
      </div>

      {/* Health Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-black/30 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            <span className="text-white font-semibold text-sm sm:text-base">You</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 sm:h-3 rounded-full transition-all duration-300"
              style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">{playerStats.hp}/{playerStats.maxHp}</p>
          <div className="flex gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
            <span className="text-orange-400 flex items-center gap-1">
              <Sword className="w-3 h-3 sm:w-4 sm:h-4" />
              {playerStats.atk}
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              {playerStats.def}
            </span>
          </div>
        </div>

        <div className="bg-black/30 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            <span className="text-white font-semibold text-sm sm:text-base">{enemy.name}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-400 h-2 sm:h-3 rounded-full transition-all duration-300"
              style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">{enemy.hp}/{enemy.maxHp}</p>
          <div className="flex gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
            <span className="text-orange-400 flex items-center gap-1">
              <Sword className="w-3 h-3 sm:w-4 sm:h-4" />
              {enemy.atk}
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              {enemy.def}
            </span>
          </div>
        </div>
      </div>

      {/* Combat Compass */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-white font-semibold mb-3 text-center text-sm sm:text-base">Attack Compass</h3>
        <div className="relative bg-gray-800 rounded-lg h-8 sm:h-12 overflow-hidden border-2 border-gray-600">
          {/* Target Zone - Green success area */}
          <div 
            className="absolute top-0 h-full bg-gradient-to-r from-green-400 to-green-500 opacity-80 border-l-2 border-r-2 border-green-300"
            style={{ 
              left: `${targetZone.start}%`, 
              width: '20%',
            }}
          />
          
          {/* Moving Player Indicator */}
          <div 
            className={`absolute top-0 w-1 sm:w-2 h-full transition-none ${
              isAttacking ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-white shadow-lg shadow-white/50'
            }`}
            style={{ 
              left: `${compassPosition}%`, 
              transform: 'translateX(-50%)',
              willChange: 'left'
            }}
          />

          {/* Compass Markers */}
          <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
            {[0, 25, 50, 75, 100].map(mark => (
              <div key={mark} className="w-px h-3 sm:h-6 bg-gray-500" />
            ))}
          </div>

          {/* Labels for clarity */}
          <div className="absolute bottom-0 sm:bottom-1 left-1 sm:left-2 text-xs text-gray-400 pointer-events-none">0%</div>
          <div className="absolute bottom-0 sm:bottom-1 right-1 sm:right-2 text-xs text-gray-400 pointer-events-none">100%</div>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-xs sm:text-sm text-gray-300">
            Hit the <span className="text-green-400 font-semibold">green zone</span> to deal damage!
          </p>
          <p className="text-xs text-gray-400">
            Miss and the enemy will attack you instead.
          </p>
        </div>
      </div>

      {/* Attack Button */}
      <div className="text-center mb-4 sm:mb-6">
        <button
          onClick={handleAttack}
          disabled={isAttacking}
          className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-white transition-all duration-200 transform text-sm sm:text-base ${
            isAttacking 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 hover:scale-105 shadow-lg hover:shadow-red-500/25'
          }`}
        >
          {isAttacking ? 'Attacking...' : 'ATTACK!'}
        </button>
      </div>

      {/* Combat Log */}
      <div className="bg-black/40 rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
        <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Combat Log</h4>
        <div className="space-y-1">
          {combatLog.slice(-6).map((log, index) => (
            <p key={index} className="text-xs sm:text-sm text-gray-300">
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};