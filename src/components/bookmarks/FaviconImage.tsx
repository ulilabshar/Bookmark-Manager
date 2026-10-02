import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { extractDomain } from '../../utils/helpers';

interface FaviconImageProps {
  url: string;
  size?: 'sm' | 'md';
  className?: string;
}

function buildFaviconSources(url: string): string[] {
  const domain = extractDomain(url);
  if (!domain) return [];
  return [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://favicon.im/${domain}`,
    `https://${domain}/favicon.ico`,
  ];
}

export const FaviconImage: React.FC<FaviconImageProps> = ({ url, size = 'md', className }) => {
  const sources = buildFaviconSources(url);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const handleError = () => {
    const next = index + 1;
    if (next < sources.length) {
      setIndex(next);
    } else {
      setFailed(true);
    }
  };

  if (failed || sources.length === 0) {
    return <Globe className={`${iconSize} text-zinc-400 dark:text-zinc-500 ${className ?? ''}`} />;
  }

  return (
    <img
      key={sources[index]}
      src={sources[index]}
      alt=""
      onError={handleError}
      className={`${iconSize} object-contain ${className ?? ''}`}
      loading="lazy"
    />
  );
};
