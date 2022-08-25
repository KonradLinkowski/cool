import { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const ColorShiftMaterial = shaderMaterial(
  {
    mouse: [0, 0],
    resolution: [1920, 1080],
    time: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
  },

  //vertex shaders
  `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,

  //fragment shaders
  `
      #ifdef GL_ES
      precision mediump float;
      #endif
      
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 mouse;
      
      const float Pi = 3.14159;
      
      float sinApprox(float x) {
          x = Pi + (2.0 * Pi) * floor(x / (2.0 * Pi)) - x;
          return (3.0 / Pi) * x - (3.0 / Pi / Pi) * x * abs(x);
      }
      
      float cosApprox(float x) {
          return sinApprox(x + 0.5 * Pi);
      }
      
      void main()
      {
        vec2 p=(3.0*gl_FragCoord.xy-resolution)/max(resolution.x,resolution.y);
        for(int i=1;i<25;i++)
        {
          vec2 newp=p;
          newp.x+=0.75/float(i)*sin(float(i)*p.y+time/10.0+0.3*float(i))+mouse.y/10.0;		
          newp.y+=0.75/float(i)*sin(float(i)*p.x+time/10.0+0.3*float(i+10))-mouse.x/10.0+15.0;
          p=newp;
        }
        vec3 col=vec3(0.5*sin(3.0*p.x)+0.5,0.5*sin(3.0*p.y)+0.5,sin(p.x+p.y));
        gl_FragColor=vec4(col, 1.0);
      }
      `
);
extend({ ColorShiftMaterial });

const GlslPlane = () => {
  const ref = useRef();
  const { size } = useThree();

  const mouseMoved = (e) => {
    if (e !== null && ref.current !== null) {
      ref.current.mouse = [e.pageX / size.width, e.pageY / size.height];
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', mouseMoved);
    return () => {
      document.removeEventListener('mousemove', mouseMoved);
    };
  }, []);

  useFrame(({ clock }) => {
    ref.current.time = clock.getElapsedTime();
    ref.current.resolution = [size.width, size.height];
  });

  return (
    <mesh>
      <planeBufferGeometry args={[3, 1.3]} />
      <colorShiftMaterial ref={ref} />
    </mesh>
  );
};

function App() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 1], fov: 60 }}>
        <Suspense fallback={null}>
          <GlslPlane />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
