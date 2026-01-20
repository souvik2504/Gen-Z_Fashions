import React, { useEffect, useState, useRef } from 'react';

const WelcomeModal = () => {
  const fullText = `Hey Gen-Z Trendsetter! 
Welcome to Gen-Z Fashions – your one-stop shop for bold styles and fresh fits.
Login and get an instant code, use at checkout and get 10% OFF🎉 on your first order!

Style starts here.`;

  const [displayedText, setDisplayedText] = useState('');
  const [textDone, setTextDone] = useState(false);
  const [showModal, setShowModal] = useState(false); // initially false
  const indexRef = useRef(0);

  useEffect(() => {
    // Show modal only if not seen in current session
    const modalShown = sessionStorage.getItem('genz_welcome_modal_shown');
    if (!modalShown) {
      setShowModal(true);
      sessionStorage.setItem('genz_welcome_modal_shown', 'true'); // set it as shown
    }
  }, []);

  useEffect(() => {
    if (!showModal) return;

    const interval = setInterval(() => {
      const currentIndex = indexRef.current;
      if (currentIndex < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(currentIndex));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
        setTextDone(true);
      }
    }, 0); // typing speed

    return () => clearInterval(interval);
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-gray-400 font-mono rounded-lg shadow-lg max-w-xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h2 className="text-2xl font-bold text-white font-[poppins]">Welcome to Gen-Z Fashions!</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 text-base whitespace-pre-wrap min-h-[180px] font-[poppins]">
          {displayedText}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t border-gray-700 flex justify-center space-x-4 transition-opacity duration-500 ${
            textDone ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            className="bg-blue-600 text-white px-4 py-2 font-[poppins] rounded transition hover:bg-blue-700"
            onClick={() => setShowModal(false)}
            disabled={!textDone}
          >
            Explore
          </button>
          <button
            className={`bg-green-600 text-white px-4 py-2 font-[poppins] rounded transition ${
              textDone ? 'animate-pulse duration-500' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => (window.location.href = '/login')}
            disabled={!textDone}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
