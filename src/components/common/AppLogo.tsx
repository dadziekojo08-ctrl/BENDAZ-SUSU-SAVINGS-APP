import React, { useState } from 'react';
import appLogoAsset from '../../assets/images/desktop_app_icon_1786814568464.jpg';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'BENDAZ SUSU',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-xl text-xs',
    md: 'w-10 h-10 rounded-2xl text-base',
    lg: 'w-12 h-12 rounded-2xl text-lg',
    xl: 'w-16 h-16 rounded-3xl text-2xl',
  }[size];

  if (hasError) {
    return (
      <div
        className={`bg-[#2E3123] border border-[#4A4D3A] text-[#D4A359] font-serif-brand font-extrabold flex items-center justify-center shadow-md flex-shrink-0 select-none ${sizeClasses} ${className}`}
        title={alt}
      >
        <span className="text-[#F9F8F4]">B</span>
        <span className="text-[#D4A359] text-[0.7em] -ml-0.5">S</span>
      </div>
    );
  }

  return (
    <img
      src={appLogoAsset}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover border border-[#4A4D3A] shadow-md flex-shrink-0 bg-[#2E3123] ${sizeClasses} ${className}`}
    />
  );
};
