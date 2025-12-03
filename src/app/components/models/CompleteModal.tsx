import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, X } from "lucide-react";

type CompleteModalProps = {
  open: boolean;
  onRestart: () => void;
  onClose: () => void;
};

const CompleteModal = ({ open, onRestart, onClose }: CompleteModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/70 backdrop-blur-lg text-gray-900 rounded-3xl shadow-2xl p-10 max-w-md w-full relative border border-green-400/40"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Close (X) Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-200/70 hover:bg-gray-300/80 transition"
            >
              <X className="w-5 h-5 text-gray-800" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <PartyPopper className="text-green-500 w-20 h-20 drop-shadow-lg" />
            </div>

            {/* Title */}
            <h2 className="text-4xl font-extrabold text-center mb-3 text-green-500">
              Congratulations!
            </h2>
            <p className="text-center text-gray-800 mb-8 text-lg">
              You completed a full circle 🎉<br />
              Fantastic job — can you beat your record?
            </p>

            {/* Buttons */}
            <div className="flex justify-center">
              <button
                onClick={onRestart}
                className="px-6 py-3 rounded-xl bg-green-600/90 hover:bg-green-700 transition font-semibold text-white shadow-lg"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompleteModal;
