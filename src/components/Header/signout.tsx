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
        className={`flex items-center justify-between px-4 py-2  text-sm font-medium text-gray-700 ${
          isOpen ? "" : ""
        }`}
      >
        {/* Original User Icon */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

      <span>{userName}</span>
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
    </div>

      </button>

      {/* Enhanced Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute mt-2 w-52  origin-top-right rounded-md bg-white shadow-lg  ring-opacity-5 focus:outline-none z-10 transition-all duration-150 ease-out"
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