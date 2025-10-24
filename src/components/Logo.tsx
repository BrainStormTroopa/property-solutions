import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-16 object-contain" }) => {
  return (
    <img
      src={`${import.meta.env.BASE_URL}rps-logo-final.png`}
      alt="Rubeus Property Solutions"
      className={className}
    />
  );
};