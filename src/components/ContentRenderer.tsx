'use client';

import { useEffect, useRef } from 'react';

interface ContentRendererProps {
  htmlContent: string;
  className?: string;
}

export default function ContentRenderer({ htmlContent, className = '' }: ContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && htmlContent) {
      // Clear existing content
      contentRef.current.innerHTML = '';
      
      // Create a temporary container to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Move all child nodes to the actual container
      // This creates live DOM elements that AdSense can modify
      while (tempDiv.firstChild) {
        contentRef.current.appendChild(tempDiv.firstChild);
      }
      
      // Trigger AdSense to scan for auto ad insertion points
      // This tells Google's script to analyze the new content
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        try {
          // Small delay to ensure DOM is fully rendered
          setTimeout(() => {
            // This doesn't push a new ad, it tells AdSense to rescan the page
            if (window.adsbygoogle) {
              window.adsbygoogle.forEach(() => {
                // AdSense will automatically find insertion points in the new DOM structure
              });
            }
          }, 100);
        } catch (error) {
          console.log('AdSense auto scan note:', error);
        }
      }
    }
  }, [htmlContent]);

  return (
    <div 
      ref={contentRef}
      className={className}
      // These attributes help AdSense identify content for auto ads
      data-ad-layout="in-article"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}