'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/app/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

interface UserData {
  uid?: string;
  userID?: string;
  name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  provider?: string;
  createdAt?: any;
  updatedAt?: any;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updateMessage, setUpdateMessage] = useState('');
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [hoverField, setHoverField] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Query users collection where uid matches current user's UID
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as UserData;
            setUserData(data);
            setFormData({
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || ''
            });
          } else {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data() as UserData;
              setUserData(data);
              setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || ''
              });
            } else {
              setUserData(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Add glitch effect for 300ms when typing
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 300);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      let userDocRef;
      if (!querySnapshot.empty) {
        userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
      } else {
        userDocRef = doc(db, 'users', user.uid);
      }
      
      await updateDoc(userDocRef, {
        ...formData,
        uid: user.uid,
        updatedAt: serverTimestamp()
      });
      
      setUserData((prev) => ({ ...prev, ...formData }));
      setEditing(false);
      setUpdateMessage('DATA ASSIMILATION COMPLETE');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      console.error('Update failed:', err);
      setUpdateMessage('TRANSMISSION FAILURE - RETRY SEQUENCE');
    }
  };

  // Random binary background effect
  const generateBinaryBackground = () => {
    let result = [];
    for (let i = 0; i < 100; i++) {
      const randomX = Math.floor(Math.random() * 100);
      const randomY = Math.floor(Math.random() * 100);
      const digit = Math.random() > 0.5 ? '1' : '0';
      const opacity = Math.random() * 0.4;
      result.push(
        <div key={i} className="absolute text-green-400" style={{
          left: `${randomX}%`,
          top: `${randomY}%`,
          opacity: opacity,
          fontSize: '0.6rem',
          transform: `rotate(${Math.random() * 360}deg)`,
          textShadow: '0 0 5px #00ff00'
        }}>
          {digit}
        </div>
      );
    }
    return result;
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center mt-24 bg-black text-green-400 font-mono">
      <div className="text-center">
        <div className="text-2xl animate-pulse">LOADING BIOMETRIC DATA...</div>
        <div className="mt-4 text-xs">ESTABLISHING NEURAL LINK</div>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-red-500 font-mono">
      <div className="text-center border-2 border-red-500 p-8 animate-pulse">
        <div className="text-2xl">ACCESS DENIED</div>
        <div className="mt-4 text-xs">AUTHENTICATION REQUIRED</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-black text-green-400 mt-24 font-mono relative overflow-hidden">
      {generateBinaryBackground()}
      
      {/* Hexagonal border */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="w-full h-full border-8 border-green-400" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto p-8 pt-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className={`text-4xl uppercase tracking-widest ${glitchEffect ? 'animate-pulse' : ''}`}>
            SPECIMEN PROFILE
          </h1>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent mt-2"></div>
        </div>
        
        {userData ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {userData.userID && (
                <div className={`border border-green-400 p-4 ${hoverField === 'userID' ? 'bg-green-900 bg-opacity-20' : ''}`}
                  onMouseEnter={() => setHoverField('userID')}
                  onMouseLeave={() => setHoverField('')}
                >
                  <div className="text-xs text-green-600 mb-1">ENTITY IDENTIFIER</div>
                  <div className="font-bold tracking-wider">{userData.userID}</div>
                </div>
              )}
              
              <div className={`border border-green-400 p-4 ${hoverField === 'name' ? 'bg-green-900 bg-opacity-20' : ''}`}
                onMouseEnter={() => setHoverField('name')}
                onMouseLeave={() => setHoverField('')}
              >
                <div className="text-xs text-green-600 mb-1">ENTITY DESIGNATION</div>
                <div className="font-bold tracking-wider">{userData.name || 'UNIDENTIFIED'}</div>
              </div>
              
              <div className={`border border-green-400 p-4 ${hoverField === 'email' ? 'bg-green-900 bg-opacity-20' : ''}`}
                onMouseEnter={() => setHoverField('email')}
                onMouseLeave={() => setHoverField('')}
              >
                <div className="text-xs text-green-600 mb-1">COMMUNICATION FREQUENCY</div>
                <div className="font-bold tracking-wider">{userData.email || 'UNDEFINED'}</div>
              </div>
              
              <div className={`border border-green-400 p-4 ${hoverField === 'phone' ? 'bg-green-900 bg-opacity-20' : ''}`}
                onMouseEnter={() => setHoverField('phone')}
                onMouseLeave={() => setHoverField('')}
              >
                <div className="text-xs text-green-600 mb-1">AUDIO TRANSMISSION CODE</div>
                <div className="font-bold tracking-wider">{userData.phone || 'UNAVAILABLE'}</div>
              </div>
              
              {userData.provider && (
                <div className={`border border-green-400 p-4 ${hoverField === 'provider' ? 'bg-green-900 bg-opacity-20' : ''}`}
                  onMouseEnter={() => setHoverField('provider')}
                  onMouseLeave={() => setHoverField('')}
                >
                  <div className="text-xs text-green-600 mb-1">ORIGIN SYSTEM</div>
                  <div className="font-bold tracking-wider">{userData.provider}</div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  setEditing(!editing);
                  setGlitchEffect(true);
                  setTimeout(() => setGlitchEffect(false), 500);
                }}
                className="px-8 py-3 border-2 border-green-400 bg-transparent text-green-400 hover:bg-green-400 hover:text-black transition-colors duration-300 uppercase tracking-widest relative overflow-hidden group"
              >
                <span className="relative z-10">{editing ? 'TERMINATE EDIT' : 'MODIFY ENTITY DATA'}</span>
                <span className="absolute inset-0 bg-green-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-red-500 p-8 text-red-500 text-center">
            <div className="text-2xl">NO BIOLOGICAL SIGNATURE DETECTED</div>
            <div className="text-sm mt-2">DATA RETRIEVAL FAILURE</div>
          </div>
        )}

        {editing && (
          <form onSubmit={handleUpdate} className="mt-12 space-y-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400 to-transparent mb-8"></div>
            
            <div className="relative">
              <label className="absolute -top-3 left-4 bg-black px-2 text-xs text-green-400" htmlFor="name">ENTITY DESIGNATION</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ENTER DESIGNATION"
                className="w-full border border-green-400 bg-black p-4 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-800"
                required
              />
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-green-400 via-transparent to-green-400"></div>
            </div>

            <div className="relative">
              <label className="absolute -top-3 left-4 bg-black px-2 text-xs text-green-400" htmlFor="email">COMMUNICATION FREQUENCY</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ENTER COMMUNICATION CODE"
                className="w-full border border-green-400 bg-black p-4 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-800"
                required
              />
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-green-400 via-transparent to-green-400"></div>
            </div>

            <div className="relative">
              <label className="absolute -top-3 left-4 bg-black px-2 text-xs text-green-400" htmlFor="phone">AUDIO TRANSMISSION CODE</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="ENTER AUDIO CODE"
                className="w-full border border-green-400 bg-black p-4 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-800"
              />
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-green-400 via-transparent to-green-400"></div>
            </div>

            <div className="flex justify-center mt-8">
              <button 
                type="submit" 
                className="px-8 py-3 bg-green-400 text-black hover:bg-green-300 transition-colors duration-300 uppercase tracking-widest relative overflow-hidden"
              >
                ASSIMILATE DATA
              </button>
            </div>
          </form>
        )}

        {updateMessage && (
          <div className={`mt-8 p-4 text-center animate-pulse ${updateMessage.includes('FAILURE') ? 'text-red-500 border border-red-500' : 'text-green-400 border border-green-400'}`}>
            {updateMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;