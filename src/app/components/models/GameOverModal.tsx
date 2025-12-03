import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

type GameOverModalProps = {
  open: boolean;
  onRestart: () => void;
  onClose: () => void;
};

const GameOverModal = ({ open, onRestart, onClose }: GameOverModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-black/90 text-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative border border-red-600/40"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Close (X) Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-700/70 hover:bg-gray-600/80 transition"
            >
              <X className="w-5 h-5 text-gray-200" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <AlertTriangle className="text-red-500 w-20 h-20 drop-shadow-lg" />
            </div>

            {/* Title */}
            <h2 className="text-4xl font-extrabold text-center mb-3 text-red-500">
              Game Over
            </h2>
            <p className="text-center text-gray-300 mb-8 text-lg">
              Oops! The ball collided with the boundary.<br />
              Try again and beat your best time!
            </p>

            {/* Buttons */}
            <div className="flex justify-center">
              <button
                onClick={onRestart}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
              >
                Restart
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameOverModal;
