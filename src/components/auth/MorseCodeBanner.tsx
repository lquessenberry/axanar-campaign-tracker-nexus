import { useState, useEffect } from 'react';

const MorseCodeBanner = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const captains = ['CAPT. GARTH', 'CAPT. SAM', 'CAPT. SONYA'];
  
  // Tactical maneuvers named after donors
  const tacticalManeuvers = [
    'BOLTIN GAMMA STRIKE',
    'KALTENBACHER DEFENSIVE PATTERN',
    'FAULKNER FLANKING MANEUVER',
    'ISSERMAN EVASIVE ACTION',
    'MILLER ASSAULT FORMATION',
    'HENSEL PINCER MOVEMENT',
    'RIERIRO SCATTER PROTOCOL',
    'MIKUS TACTICAL RETREAT',
    'KETCHUM BOMBARDMENT',
    'FOUDOS STEALTH APPROACH',
    'ALSTON INTERCEPTION',
    'FLASCHEN COUNTER-ATTACK',
    'TABBENOR SIEGE POSITION',
    'FERNANDES PURSUIT VECTOR',
    'VAN DER AAR BLOCKADE',
    'NEWBOLD RECONNAISSANCE',
    'LIEBMINGER ASSAULT WAVE',
    'WENDT DEFENSIVE GRID',
    'ELSMORE STRIKE FORCE'
  ];

  const interferenceSymbols = ['▓', '░', '▒', '█', '▌', '▐', '▀', '▄', '■', '□', '▪', '▫'];
  const staticNoise = ['#', '*', '%', '@', '&', '$', '!', '?', '~', '^', '+', '='];

  const generateInterference = () => {
    const symbols = [...interferenceSymbols, ...staticNoise];
    return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, () => 
      symbols[Math.floor(Math.random() * symbols.length)]
    ).join('');
  };

  const generateTransmission = () => {
    const fromCaptain = captains[Math.floor(Math.random() * captains.length)];
    const toCaptain = captains.filter(c => c !== fromCaptain)[Math.floor(Math.random() * 2)];
    const maneuver = tacticalManeuvers[Math.floor(Math.random() * tacticalManeuvers.length)];
    const stardate = (Math.random() * 9999 + 1000).toFixed(2);
    const frequency = (Math.random() * 999 + 100).toFixed(1);
    
    const transmissionTypes = [
      `${generateInterference()} ${fromCaptain} TO ${toCaptain} :: EXECUTE ${maneuver} :: STARDATE ${stardate} ${generateInterference()}`,
      `${generateInterference()} FREQ ${frequency}MHz :: ${fromCaptain} :: ${maneuver} CONFIRMED :: STATUS GREEN ${generateInterference()}`,
      `${generateInterference()} TACTICAL UPDATE :: ${toCaptain} :: ${maneuver} IN PROGRESS :: ETA 0${Math.floor(Math.random() * 9) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')} ${generateInterference()}`,
      `${generateInterference()} PRIORITY ALPHA :: ${fromCaptain} TO FLEET :: INITIATE ${maneuver} :: ACKNOWLEDGE ${generateInterference()}`,
      `${generateInterference()} COMM INTERFERENCE :: FREQ ${frequency}MHz :: ${toCaptain} :: ${maneuver} PATTERN DELTA ${generateInterference()}`
    ];

    return transmissionTypes[Math.floor(Math.random() * transmissionTypes.length)];
  };

  useEffect(() => {
    const transmissionInterval = setInterval(() => {
      setIsTransmitting(true);
      
      // Generate a new transmission
      const newTransmission = generateTransmission();
      setCurrentMessage(newTransmission);
      
      // Stop transmitting after the message duration
      setTimeout(() => {
        setIsTransmitting(false);
      }, 8000 + Math.random() * 4000); // 8-12 seconds
      
    }, 12000 + Math.random() * 8000); // Every 12-20 seconds

    return () => clearInterval(transmissionInterval);
  }, []);

  if (!isTransmitting || !currentMessage) return null;

  return (
    <div className="fixed top-16 left-0 w-full z-30 bg-black/90 border-y border-axanar-teal/30">
      <div className="relative overflow-hidden">
        {/* Scrolling text */}
        <div className="animate-[scroll_15s_linear_infinite] whitespace-nowrap text-axanar-teal font-mono text-xs py-1">
          <span className="inline-block px-4">
            {currentMessage}
          </span>
        </div>
        
        {/* Static overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-axanar-teal/5 to-transparent animate-pulse" />
        
        {/* Transmission indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <div className="w-1 h-1 bg-axanar-teal rounded-full animate-pulse" />
          <span className="text-axanar-teal/70 font-mono text-xs">TX</span>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeBanner;