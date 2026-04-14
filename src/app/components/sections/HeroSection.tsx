interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
}

export function HeroSection({ backgroundImage, title, subtitle }: HeroSectionProps) {
  return (
    <>
      {/* Lazy load background image */}
      <img 
        src={backgroundImage} 
        alt="" 
        loading="lazy"
        style={{ display: 'none' }}
      />
      
      <div 
        className="relative w-full h-64 sm:h-80 md:h-[500px] bg-cover bg-no-repeat overflow-hidden"
        style={{ 
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/50" />
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-center text-center text-white px-3 sm:px-4">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 drop-shadow-md">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}




