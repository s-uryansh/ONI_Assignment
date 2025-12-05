'use client';

import type { ReactNode } from "react";
import SparkleNavbar from "../UI/Navbar";
import { useAuth } from "../Auth/Auth";
import InteractiveGridBackground from "../Background/grid";
import AuthDialog from "../Auth/Dialog";
import { useState } from "react";

export default function PersistentLayout({ children }: { children: ReactNode }) {
  const { user, setUser, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleAuthSuccess = (u: any) => {
    setUser(u);
    setShowAuth(false);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <InteractiveGridBackground
          gridSize={40}
          gridColor="#d1d5db"
          darkGridColor="#1f2937"
          effectColor="rgba(0,255,255,0.5)"
          darkEffectColor="rgba(255,0,255,0.5)"
          trailLength={5}
          glow
          glowRadius={30}
          showFade
          fadeIntensity={25}
        />
      </div>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <SparkleNavbar
            items={[
              { label: "Home", path: "/" },
              { label: "Book", path: "/books" },
              { label: "Authors", path: "/authors" },
              { label: "User", path: "/user" },
            ]}
            color="#1E90FF"
          />
        
          <div
            style={{
              position: "absolute",
              right: "2rem",
              top: "2rem",
            }}
          >
            {user ? (
              <span className="text-white font-semibold">Welcome {user.fullName}</span>
            ) : (
              <button onClick={() => setShowAuth(true)}>
                Login/Register
              </button>
            )}
            <div>
              {user && (
                <button onClick={() => { logout(); }}>
                  Logout
                </button>
              )}
            </div>
          </div>
          
        </div>


      <div style={{ position: "relative", zIndex: 20 }}>
        {children}
      </div>
      
      {showAuth && (
        <AuthDialog 
          onClose={() => setShowAuth(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}
