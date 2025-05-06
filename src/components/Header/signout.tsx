import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase"; // Adjust path to your Firebase config

interface DropdownMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Account");
  const [loading, setLoading] = useState(true);
  let closeTimeout: NodeJS.Timeout;

  // Fetch user data from Firebase
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          setUserName(user.displayName || userData?.name || "Account");
        } catch (error) {
          console.error("Error fetching user:", error);
          setUserName("Account");
        }
      } else {
        setUserName("Account");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-close dropdown after delay (3 seconds)
  const startCloseTimer = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => setIsOpen(false), 200);
  };

  const stopCloseTimer = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
    stopCloseTimer(); // Cancel auto-close if user re-enters
  };

  const handleMouseLeave = () => {
    startCloseTimer(); // Start auto-close countdown
  };

  if (loading) {
    return (
      <div className="relative inline-block text-left">
        <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300">
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dropdown Button (Original Style) */}
      <button
        className={`flex items-center justify-between px-4 py-2 rounded-md border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
          isOpen ? "bg-gray-50 ring-2 ring-blue-100" : ""
        }`}
      >
        {/* Original User Icon */}
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 12a5 5 0 100-10 5 5 0 000 10zm-7 8a7 7 0 0114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <span>{userName}</span>
        </div>
        {/* Chevron Icon */}
        <svg
          className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Enhanced Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition-all duration-150 ease-out"
          onMouseEnter={stopCloseTimer} // Pause auto-close when hovering menu
          onMouseLeave={startCloseTimer} // Resume auto-close when leaving menu
        >
          <div className="py-1">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href || "#"}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsOpen(false); // Close immediately on click
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;