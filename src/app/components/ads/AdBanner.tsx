import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

type AdBannerProps = {
  position: "left" | "right" | "top" | "bottom";
  houseAds?: {
    image: string;
    title: string;
    description: string;
    cta: string;
    link: string;
  }[];
};

const AdBanner = ({ position, houseAds = [] }: AdBannerProps) => {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [currentHouseAd, setCurrentHouseAd] = useState(() => 
    houseAds.length > 0 ? Math.floor(Math.random() * houseAds.length) : 0
  );
  const rotationCount = useRef(0);
  const googleAttempts = useRef(0);
  const maxGoogleAttempts = 3;
  const rotationInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Generate random rotation interval between 40-60 seconds for each banner (40 sec minimum)
  const getRandomRotationTime = () => Math.floor(Math.random() * 20000) + 40000;

  const getRandomHouseAd = (currentIndex: number) => {
    if (houseAds.length <= 1) return 0;
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * houseAds.length);
    } while (newIndex === currentIndex && houseAds.length > 1);
    
    return newIndex;
  };

  const tryLoadGoogleAd = () => {
    if (googleAttempts.current >= maxGoogleAttempts) {
      console.log("Max Google Ad attempts reached, staying with house ads");
      return;
    }

    googleAttempts.current += 1;
    console.log(`Attempting to load Google Ad (attempt ${googleAttempts.current}/${maxGoogleAttempts})`);

    try {
      // Clear any existing ad content
      const existingAds = document.querySelectorAll(".adsbygoogle");
      existingAds.forEach((ad) => {
        if (ad.innerHTML) {
          ad.innerHTML = "";
        }
      });

      (window.adsbygoogle = window.adsbygoogle || []).push({});

      // Check after 3s if Google ad filled
      setTimeout(() => {
        const adSlots = document.querySelectorAll(".adsbygoogle");
        let hasContent = false;

        adSlots.forEach((el) => {
          if (el && (el.childNodes.length > 0 || el.innerHTML.trim() !== "")) {
            hasContent = true;
          }
        });

        if (hasContent) {
          console.log("Google Ad loaded successfully");
          setGoogleLoaded(true);
        } else {
          console.log(`Google Ad failed to load (attempt ${googleAttempts.current})`);
          setGoogleLoaded(false);
          if (googleAttempts.current < maxGoogleAttempts) {
            rotationCount.current = 0; // Reset rotation for next attempt cycle
            setCurrentHouseAd(getRandomHouseAd(currentHouseAd));
          }
        }
      }, 3000);
    } catch (e) {
      console.warn("AdSense error:", e);
      setGoogleLoaded(false);
      setCurrentHouseAd(getRandomHouseAd(currentHouseAd));
    }
  };

  useEffect(() => {
    // Initial attempt to load Google ad
    tryLoadGoogleAd();
  }, []);

  useEffect(() => {
    // Clear any existing interval
    if (rotationInterval.current) {
      clearInterval(rotationInterval.current);
      rotationInterval.current = null;
    }

    if (!googleLoaded && houseAds.length > 0) {
      const startRotation = () => {
        rotationInterval.current = setInterval(() => {
          setCurrentHouseAd((prev) => {
            const next = getRandomHouseAd(prev);
            rotationCount.current += 1;

            // Retry Google every 5 rotations, but only if we haven't reached max attempts
            if (rotationCount.current % 5 === 0 && googleAttempts.current < maxGoogleAttempts) {
              tryLoadGoogleAd();
            }

            return next;
          });
        }, getRandomRotationTime());
      };

      // Start rotation with a random delay to desync banners
      const initialDelay = Math.floor(Math.random() * 10000); // 0-10 seconds initial delay
      setTimeout(startRotation, initialDelay);
    }

    return () => {
      if (rotationInterval.current) {
        clearInterval(rotationInterval.current);
        rotationInterval.current = null;
      }
    };
  }, [googleLoaded, houseAds.length, currentHouseAd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rotationInterval.current) {
        clearInterval(rotationInterval.current);
        rotationInterval.current = null;
      }
    };
  }, []);

  // Get responsive classes based on position
  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "fixed top-1/2 -translate-y-1/2 left-4 hidden lg:flex w-44 h-80";
      case "right":
        return "fixed top-1/2 -translate-y-1/2 right-4 hidden lg:flex w-44 h-80";
      case "top":
        return "fixed top-2 left-1/2 -translate-x-1/2 w-[90%] sm:w-80 h-20 flex lg:hidden";
      case "bottom":
        return "fixed bottom-2 left-1/2 -translate-x-1/2 w-[90%] sm:w-80 h-20 flex lg:hidden";
      default:
        return "fixed bottom-2 left-1/2 -translate-x-1/2 w-[90%] sm:w-80 h-20 flex lg:hidden";
    }
  };

  const baseClasses = `
    ${getPositionClasses()}
    z-50 shadow-2xl rounded-2xl overflow-hidden bg-white
  `;

  // Get layout classes for house ads based on position
  const getHouseAdLayout = () => {
    if (position === "left" || position === "right") {
      return "w-full h-full flex flex-col items-center justify-between bg-gradient-to-br from-purple-600 to-indigo-700 text-white";
    } else {
      return "w-full h-full flex items-center bg-gradient-to-r from-purple-600 to-indigo-700 text-white";
    }
  };

  const getImageClasses = () => {
    if (position === "left" || position === "right") {
      return "w-full h-24 object-cover";
    } else {
      return "w-20 h-full object-cover";
    }
  };

  const getContentClasses = () => {
    if (position === "left" || position === "right") {
      return "p-2 text-center flex-1 flex flex-col justify-center";
    } else {
      return "flex-1 p-2 flex flex-col justify-center";
    }
  };

  const getButtonClasses = () => {
    if (position === "left" || position === "right") {
      return "mb-2 px-3 py-1 bg-yellow-400 text-black rounded-lg text-xs font-semibold hover:bg-yellow-300 transition";
    } else {
      return "px-3 py-1 bg-yellow-400 text-black rounded-lg text-xs font-semibold hover:bg-yellow-300 transition whitespace-nowrap";
    }
  };

  return (
    <div className={baseClasses}>
      {googleLoaded ? (
        <div className="w-full h-full">
          <ins
            className="adsbygoogle block w-full h-full"
            style={{ display: "block" }}
            data-ad-client="ca-pub-xxxxxxxxxxxxxxxx" // Replace with your ad client ID
            data-ad-slot="1234567890" // Replace with your ad slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {houseAds.length > 0 ? (
            <motion.a
              key={currentHouseAd}
              href={houseAds[currentHouseAd].link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className={getHouseAdLayout()}
            >
              <img
                src={houseAds[currentHouseAd].image}
                alt="House Ad"
                className={getImageClasses()}
              />
              <div className={getContentClasses()}>
                <h3 className={`font-bold ${position === "left" || position === "right" ? "text-sm" : "text-xs"}`}>
                  {houseAds[currentHouseAd].title}
                </h3>
                <p className={`text-gray-200 ${position === "left" || position === "right" ? "text-xs" : "text-xs"}`}>
                  {houseAds[currentHouseAd].description}
                </p>
              </div>
              {(position === "left" || position === "right") ? (
                <button className={getButtonClasses()}>
                  {houseAds[currentHouseAd].cta}
                </button>
              ) : (
                <div className="pr-2">
                  <button className={getButtonClasses()}>
                    {houseAds[currentHouseAd].cta}
                  </button>
                </div>
              )}
            </motion.a>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-800 text-white text-sm">
              <div className="text-center">
                <p>Ad Space Available</p>
                {googleAttempts.current > 0 && (
                  <p className="text-xs text-gray-400">
                    Attempts: {googleAttempts.current}/{maxGoogleAttempts}
                  </p>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default AdBanner;