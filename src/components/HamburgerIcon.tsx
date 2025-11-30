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
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-300"
    >
      <rect
        className={`transform transition-all duration-300 ease-in-out origin-center ${
          isOpen ? 'rotate-45 translate-y-2' : ''
        }`}
        x="0"
        y="2"
        width="24"
        height="3"
        rx="1.5"
        fill="currentColor"
      />
      <rect
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
        x="0"
        y="8.5"
        width="24"
        height="3"
        rx="1.5"
        fill="currentColor"
      />
      <rect
        className={`transform transition-all duration-300 ease-in-out origin-center ${
          isOpen ? '-rotate-45 -translate-y-2' : ''
        }`}
        x="0"
        y="15"
        width="24"
        height="3"
        rx="1.5"
        fill="currentColor"
      />
    </svg>
  );
};

export default HamburgerIcon;