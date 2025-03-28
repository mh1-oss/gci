
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/data/initialData";
import { getBanners } from "@/services/dataService";
import { Button } from "@/components/ui/button";

const HeroSlider = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderHeight, setSliderHeight] = useState(70);
  const [textColor, setTextColor] = useState("#ffffff");
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});

  useEffect(() => {
    getBanners().then(data => {
      setBanners(data);
      // Set slider height and text color if provided in the banner data
      if (data.length > 0 && data[0].sliderHeight) {
        setSliderHeight(data[0].sliderHeight);
      }
      if (data.length > 0 && data[0].textColor) {
        setTextColor(data[0].textColor);
      }
    });
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    // Pause all videos when changing slides
    Object.values(videoRefs.current).forEach(videoEl => {
      if (videoEl) {
        videoEl.pause();
      }
    });

    // Play the current video if it exists
    const currentBanner = banners[currentIndex];
    if (currentBanner && currentBanner.mediaType === 'video' && videoRefs.current[currentBanner.id]) {
      const videoEl = videoRefs.current[currentBanner.id];
      if (videoEl) {
        videoEl.currentTime = 0;
        videoEl.play().catch(err => console.log('Video autoplay was prevented'));
      }
    }
  }, [currentIndex, banners]);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % banners.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative bg-gray-100 overflow-hidden" 
      style={{ height: `${sliderHeight}vh`, minHeight: "400px" }}
      dir="rtl"
    >
      {/* Slides */}
      {banners.map((banner, index) => {
        const isVideoMedia = banner.mediaType === 'video' || isVideo(banner.image);
        
        return (
          <div 
            key={banner.id}
            className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              background: isVideoMedia ? 'rgba(0, 0, 0, 0.5)' : 
                `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {isVideoMedia && (
              <video
                ref={el => videoRefs.current[banner.id] = el}
                className="absolute inset-0 w-full h-full object-cover"
                src={banner.videoUrl || banner.image}
                muted
                loop
                playsInline
              />
            )}
            <div className="container-custom text-center relative z-10" style={{ color: textColor }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
                {banner.title}
              </h1>
              <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 animate-fade-in">
                {banner.subtitle}
              </p>
              <Link to={banner.ctaLink}>
                <Button size="lg" className="animate-fade-in">
                  {banner.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
      
      {/* Navigation Arrows */}
      <button 
        onClick={goToPrevious}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronRight size={24} />
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronLeft size={24} />
      </button>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
