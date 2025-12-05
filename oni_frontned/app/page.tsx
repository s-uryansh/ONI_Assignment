'use client';
import { InteractiveGradient } from "./components/Cards/card";

export default function LandingPage() {

  return (
        <div style={{ width: '350px', margin: '0 auto', paddingTop: '200px' }}>
            <InteractiveGradient
              color="#1890ff"
              glowColor="#107667ed"
              followMouse={true}
              hoverOnly={false}
              intensity={100}
              backgroundColor="#000000" 
              width="20rem"
              height="20rem"
              borderRadius="2.25rem"
            >
              <p>Full-Stack Intern Assignment at ONI</p>
            </InteractiveGradient>
        </div>


  );
}

