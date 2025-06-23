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
      
      // Note: AdSense auto ads will automatically scan the new DOM content
      // No manual triggering needed - the live DOM structure we created
      // will be detected by Google's auto ads algorithm automatically
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