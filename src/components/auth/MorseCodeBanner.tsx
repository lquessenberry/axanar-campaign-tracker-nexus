import { useState, useEffect } from 'react';

const MorseCodeBanner = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionType, setTransmissionType] = useState<'normal' | 'scrambled' | 'threat'>('normal');

  const captains = ['CAPT. GARTH', 'CAPT. SAM', 'CAPT. SONYA'];
  
  // Ranked crew members using donor names
  const crewRanks = ['LT.', 'CMDR.', 'ENS.', 'LT. CMDR.', 'CHIEF', 'CPO'];
  const crewNames = [
    'BOLTIN', 'KALTENBACHER', 'FAULKNER', 'ISSERMAN', 'MILLER', 'HENSEL', 'RIERIRO', 'MIKUS', 
    'KETCHUM', 'FOUDOS', 'ALSTON', 'FLASCHEN', 'TABBENOR', 'FERNANDES', 'VAN DER AAR', 'NEWBOLD', 
    'LIEBMINGER', 'WENDT', 'ELSMORE', 'HARRISON', 'CHEN', 'RODRIGUEZ', 'THOMPSON', 'WILLIAMS'
  ];
  
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
  const deadTransmissionNoise = ['...', '---', '•••', '–––', '▬▬▬', '━━━', '═══', '~~~'];

  const generateInterference = () => {
    const symbols = [...interferenceSymbols, ...staticNoise];
    return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, () => 
      symbols[Math.floor(Math.random() * symbols.length)]
    ).join('');
  };

  const generateHeavyInterference = () => {
    const symbols = [...interferenceSymbols, ...staticNoise, ...deadTransmissionNoise];
    return Array.from({ length: Math.floor(Math.random() * 20) + 10 }, () => 
      symbols[Math.floor(Math.random() * symbols.length)]
    ).join(' ');
  };

  const generateCrewMember = () => {
    const rank = crewRanks[Math.floor(Math.random() * crewRanks.length)];
    const name = crewNames[Math.floor(Math.random() * crewNames.length)];
    return `${rank} ${name}`;
  };

  const generateTransmission = () => {
    const fromCaptain = captains[Math.floor(Math.random() * captains.length)];
    const toCaptain = captains.filter(c => c !== fromCaptain)[Math.floor(Math.random() * 2)];
    const maneuver = tacticalManeuvers[Math.floor(Math.random() * tacticalManeuvers.length)];
    const stardate = (Math.random() * 9999 + 1000).toFixed(2);
    const frequency = (Math.random() * 999 + 100).toFixed(1);
    const crewMember = generateCrewMember();
    const crewMember2 = generateCrewMember();
    
    // Determine transmission type based on random chance
    const rand = Math.random();
    let type: 'normal' | 'scrambled' | 'threat' = 'normal';
    
    if (rand < 0.3) {
      type = 'scrambled'; // 30% chance of scrambled
    } else if (rand < 0.15) {
      type = 'threat'; // 15% chance of threat
    }
    
    setTransmissionType(type);

    if (type === 'scrambled') {
      // Scrambled transmissions with heavy interference
      const scrambledTypes = [
        `${generateHeavyInterference()} ▓▓▓ SIGNAL LOST ▓▓▓ ${generateHeavyInterference()}`,
        `${generateInterference()} ░░░ DESCRAMBLING ░░░ FREQ ${frequency}MHz ░░░ ${generateHeavyInterference()}`,
        `${generateHeavyInterference()} ███ NO CARRIER ███ ${generateInterference()}`,
        `${generateInterference()} ▒▒▒ STATIC ▒▒▒ ${deadTransmissionNoise[Math.floor(Math.random() * deadTransmissionNoise.length)]} ▒▒▒ ${generateHeavyInterference()}`,
        `${generateHeavyInterference()} ▓░▒█ TRANSMISSION CORRUPTED █▒░▓ ${generateHeavyInterference()}`
      ];
      return scrambledTypes[Math.floor(Math.random() * scrambledTypes.length)];
    }

    if (type === 'threat') {
      // Klingon threat alerts
      const threatTypes = [
        `${generateInterference()} ⚠️ RED ALERT ⚠️ KLINGON VESSELS DETECTED BEARING ${Math.floor(Math.random() * 360)}° MARK ${Math.floor(Math.random() * 90)} ⚠️ ${generateInterference()}`,
        `${generateInterference()} 🚨 THREAT ASSESSMENT: BIRD OF PREY CLASS :: ${fromCaptain} :: ALL HANDS BATTLE STATIONS 🚨 ${generateInterference()}`,
        `${generateInterference()} ⚠️ KLINGON DISRUPTOR SIGNATURE :: FREQ ${frequency}MHz :: ${maneuver} EVASIVE NOW ⚠️ ${generateInterference()}`,
        `${generateInterference()} 🚨 MULTIPLE CONTACTS :: ${toCaptain} :: KLINGON ATTACK FORMATION :: EXECUTE ${maneuver} 🚨 ${generateInterference()}`,
        `${generateInterference()} ⚠️ INCOMING PHOTON TORPEDOES :: ALL SHIPS :: ${maneuver} :: STARDATE ${stardate} ⚠️ ${generateInterference()}`
      ];
      return threatTypes[Math.floor(Math.random() * threatTypes.length)];
    }

    // Normal transmissions including crew dialog
    const normalTypes = [
      `${generateInterference()} ${fromCaptain} TO ${toCaptain} :: EXECUTE ${maneuver} :: STARDATE ${stardate} ${generateInterference()}`,
      `${generateInterference()} FREQ ${frequency}MHz :: ${fromCaptain} :: ${maneuver} CONFIRMED :: STATUS GREEN ${generateInterference()}`,
      `${generateInterference()} TACTICAL UPDATE :: ${toCaptain} :: ${maneuver} IN PROGRESS :: ETA 0${Math.floor(Math.random() * 9) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')} ${generateInterference()}`,
      `${generateInterference()} PRIORITY ALPHA :: ${fromCaptain} TO FLEET :: INITIATE ${maneuver} :: ACKNOWLEDGE ${generateInterference()}`,
      `${generateInterference()} COMM INTERFERENCE :: FREQ ${frequency}MHz :: ${toCaptain} :: ${maneuver} PATTERN DELTA ${generateInterference()}`,
      `${generateInterference()} BRIDGE TO ${crewMember} :: REROUTE POWER TO FORWARD SHIELDS :: CONFIRM ${generateInterference()}`,
      `${generateInterference()} ${crewMember} TO BRIDGE :: ${fromCaptain} :: WEAPONS SYSTEMS ONLINE :: READY FOR ${maneuver} ${generateInterference()}`,
      `${generateInterference()} ENGINEERING TO ${crewMember2} :: WARP CORE STABLE :: ${fromCaptain} :: READY FOR COMBAT MANEUVERS ${generateInterference()}`,
      `${generateInterference()} ${crewMember} TO ${crewMember2} :: TARGETING SENSORS LOCKED :: AWAITING ORDERS FROM ${fromCaptain} ${generateInterference()}`,
      `${generateInterference()} SICKBAY TO BRIDGE :: ${crewMember} :: MEDICAL TEAMS STANDING BY :: STARDATE ${stardate} ${generateInterference()}`,
      `${generateInterference()} ${crewMember2} TO ALL STATIONS :: ${maneuver} COMMENCING :: REPORT STATUS TO ${fromCaptain} ${generateInterference()}`
    ];

    return normalTypes[Math.floor(Math.random() * normalTypes.length)];
  };

  useEffect(() => {
    // Start with an initial transmission
    const initialTransmission = generateTransmission();
    setCurrentMessage(initialTransmission);
    setIsTransmitting(true);

    const scheduleNextTransmission = (message: string) => {
      // Calculate scroll duration based on message length
      // Each character takes about 0.2 seconds to scroll at 25s total animation
      const scrollDuration = Math.max(25000, message.length * 200);
      
      // Wait for current transmission to completely finish before starting new one
      setTimeout(() => {
        const newTransmission = generateTransmission();
        setCurrentMessage(newTransmission);
        scheduleNextTransmission(newTransmission);
      }, scrollDuration + 1000); // Add 1 second buffer for clean transition
    };

    // Schedule the first next transmission
    scheduleNextTransmission(initialTransmission);
  }, []);

  // Always show the banner when there's a message
  if (!currentMessage) return null;

  // Color coding based on transmission type
  const getBannerColors = () => {
    switch (transmissionType) {
      case 'threat':
        return {
          bg: 'bg-red-900/90',
          border: 'border-red-500/50',
          text: 'text-red-300',
          indicator: 'bg-red-400',
          indicatorText: 'text-red-300/70',
          overlay: 'bg-gradient-to-r from-transparent via-red-500/10 to-transparent'
        };
      case 'scrambled':
        return {
          bg: 'bg-yellow-900/90',
          border: 'border-yellow-500/50',
          text: 'text-yellow-300',
          indicator: 'bg-yellow-400',
          indicatorText: 'text-yellow-300/70',
          overlay: 'bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent'
        };
      default:
        return {
          bg: 'bg-black/90',
          border: 'border-axanar-teal/30',
          text: 'text-axanar-teal',
          indicator: 'bg-axanar-teal',
          indicatorText: 'text-axanar-teal/70',
          overlay: 'bg-gradient-to-r from-transparent via-axanar-teal/5 to-transparent'
        };
    }
  };

  const colors = getBannerColors();

  return (
    <div className={`fixed top-16 left-0 w-full z-30 ${colors.bg} border-y ${colors.border}`}>
      <div className="relative overflow-hidden">
        {/* Scrolling text - slowed down to 25s */}
        <div className={`animate-[scroll_25s_linear_infinite] whitespace-nowrap ${colors.text} font-mono text-xs py-1`}>
          <span className="inline-block px-4">
            {currentMessage}
          </span>
        </div>
        
        {/* Static overlay effect */}
        <div className={`absolute inset-0 ${colors.overlay} animate-pulse`} />
        
        {/* Transmission indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <div className={`w-1 h-1 ${colors.indicator} rounded-full animate-pulse`} />
          <span className={`${colors.indicatorText} font-mono text-xs`}>
            {transmissionType === 'threat' ? 'RED' : transmissionType === 'scrambled' ? 'SCR' : 'TX'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeBanner;