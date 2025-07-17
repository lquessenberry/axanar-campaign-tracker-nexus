import React from 'react';

interface HamburgerIconProps {
  isOpen: boolean;
}

const HamburgerIcon: React.FC<HamburgerIconProps> = ({ isOpen }) => {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="filter drop-shadow-[1px_1px_2px_rgba(0,0,0,0.2)] drop-shadow-[-1px_-1px_2px_rgba(255,255,255,0.2)]"
    >
      <rect
        className={`transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'rotate-45 translate-x-[5px] translate-y-[5px]' : ''
        }`}
        x="0"
        y="2"
        width="24"
        height="4"
        rx="1"
        fill="#D4A017"
      />
      <rect
        className={`transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
        x="0"
        y="8"
        width="24"
        height="4"
        rx="1"
        fill="#D4A017"
      />
      <rect
        className={`transform transition-transform duration-300 ease-in-out ${
          isOpen ? '-rotate-45 translate-x-[5px] translate-y-[-5px]' : ''
        }`}
        x="0"
        y="14"
        width="24"
        height="4"
        rx="1"
        fill="#D4A017"
      />
    </svg>
  );
};

export default HamburgerIcon;