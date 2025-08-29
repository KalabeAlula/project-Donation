import React from 'react';

interface TeamMemberImageProps {
  src: string;
  alt: string;
  className?: string;
  adjustPosition?: boolean;
  positionStyles?: {
    objectPosition?: string;
    transform?: string;
  };
}

const TeamMemberImage: React.FC<TeamMemberImageProps> = ({
  src,
  alt,
  className = '',
  adjustPosition = false,
  positionStyles = {}
}) => {
  // Special handling for Denekew's image
  const isDenekewImage = src.includes('DenekewBerihunKebed');
  
  // Default styles for the image
  const defaultStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  // Apply special positioning for Denekew's image
  const imageStyles: React.CSSProperties = isDenekewImage
    ? {
        ...defaultStyles,
        objectPosition: '50% 30%', // Move the image up to center the face
        objectFit: 'cover',
        transform: 'scale(1.15)', // Zoom in slightly to better frame the face
      }
    : defaultStyles;

  // Apply any custom position styles if provided
  const finalStyles = adjustPosition
    ? { ...imageStyles, ...positionStyles }
    : imageStyles;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={finalStyles}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = `https://placehold.co/300x300/0ea5e9/ffffff?text=${alt.split(' ').map(n => n[0]).join('')}`;
      }}
    />
  );
};

export default TeamMemberImage;