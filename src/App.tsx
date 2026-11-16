import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import affanPhoto from "./assets/affan-birthday-photo.jpg";
import ageSevenVideo from "./assets/affan-age-seven.mp4";
import ageSixPhoto from "./assets/affan-age-six.jpg";
import ageThreePhoto from "./assets/affan-age-three.jpg";
import creativityPhoto from "./assets/affan-creativity.jpg";
import finalTributeVideo from "./assets/affan-final-tribute.mp4";
import firstYearPhoto from "./assets/affan-first-year.jpg";
import firstStepsVideo from "./assets/affan-first-steps.mp4";
import goodTimeVideo from "./assets/affan-good-time.mp4";
import growingUpPhoto from "./assets/affan-growing-up.jpg";
import schoolAgainVideo from "./assets/affan-school-again.mp4";
import schoolVideo from "./assets/affan-school.mp4";
import birthdayBackground from "./assets/happy-birthday-background.mp4";

type Screen = "title" | "creator" | "obby" | "finale";
type Surprise = "gift" | "balloons" | "candles" | null;
type Memory =
  | "first-year"
  | "first-steps"
  | "age-three"
  | "creativity"
  | "school"
  | "growing-up"
  | "school-again"
  | "good-time"
  | "age-six"
  | "age-seven"
  | "final-tribute";
type Action = "idle" | "run" | "jump" | "wave" | "cheer";
type FinaleStage = "candles" | "ready" | "cutting" | "ride" | "done";
type Config = { skin: number; hair: number; shirt: number; hat: number; pet: number };

const COLORS = {
  sky: "#cdeefa",
  cream: "#fff8eb",
  blue: "#7fc8f8",
  mint: "#7ed6b3",
  peach: "#ffad8a",
  yellow: "#f6d76f",
  pink: "#f3a7c3",
  lavender: "#c9b6f4",
  ink: "#405e70",
};
const PALETTE = [COLORS.blue, COLORS.mint, COLORS.peach, COLORS.yellow, COLORS.pink];
const SKINS = ["#f8cfa5", "#dca16d", "#a96f49", "#71452f"];
const SHIRTS = [COLORS.blue, COLORS.mint, COLORS.pink, COLORS.yellow];
const PETS = ["#d99862", "#a7bdca", COLORS.mint];
const DEFAULT_CONFIG: Config = { skin: 0, hair: 1, shirt: 0, hat: 1, pet: 0 };
const PATH = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(2.8, 0.7, -4),
  new THREE.Vector3(0.5, 1.25, -8),
  new THREE.Vector3(-3.1, 0.65, -12),
  new THREE.Vector3(-1.2, 1.7, -16),
  new THREE.Vector3(2.8, 1.15, -20),
  new THREE.Vector3(4.1, 2.15, -24),
  new THREE.Vector3(1.2, 2.8, -28),
  new THREE.Vector3(-2.6, 2.2, -32),
  new THREE.Vector3(-4, 3.15, -36),
  new THREE.Vector3(-1.4, 3.65, -40),
  new THREE.Vector3(2.3, 3.1, -44),
  new THREE.Vector3(0, 4.25, -48),
  new THREE.Vector3(-3.2, 4.8, -52),
  new THREE.Vector3(0, 5.3, -56),
  new THREE.Vector3(3, 5.8, -60),
];
const FAMILY = [
  ["Umair Baba", COLORS.blue, 3],
  ["Saba Mama", COLORS.pink, 2],
  ["Irha", COLORS.lavender, 2],
] as const;

const sharedMaterials = new Map<string, THREE.MeshStandardMaterial>();
function sharedMaterial(color: string, transparent = false) {
  const key = `${color}-${transparent}`;
  if (!sharedMaterials.has(key)) {
    sharedMaterials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.78,
        metalness: 0,
        transparent,
        opacity: transparent ? 0.82 : 1,
      }),
    );
  }
  return sharedMaterials.get(key)!;
}

function Icon({ name, size = 30 }: { name: string; size?: number }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const art: Record<string, React.ReactNode> = {
    play: <path fill="currentColor" d="M8.5 5.5v13l10-6.5z" />,
    arrow: (
      <>
        <path {...p} d="M4 12h16M14 6l6 6-6 6" />
      </>
    ),
    coin: (
      <>
        <circle {...p} fill={COLORS.yellow} cx="12" cy="12" r="8.5" />
        <path {...p} d="M12 7.5v9M9 10h4a1.6 1.6 0 010 3h-2a1.6 1.6 0 000 3h4" />
      </>
    ),
    star: (
      <path
        {...p}
        fill={COLORS.yellow}
        d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"
      />
    ),
    hand: (
      <path
        {...p}
        fill="#fff4df"
        d="M9.3 11V5.5a1.4 1.4 0 112.8 0V10 4.5a1.4 1.4 0 112.8 0V10 6a1.4 1.4 0 112.8 0v5-2a1.4 1.4 0 112.8 0v5c0 4.4-2.5 7-6.4 7h-1.4c-2 0-3.5-.9-4.7-2.5l-4-4.8a1.7 1.7 0 012.6-2.1l2.7 3.2Z"
      />
    ),
    gift: (
      <>
        <path {...p} fill={COLORS.pink} d="M4 10h16v11H4zM3 7h18v4H3z" />
        <path
          {...p}
          d="M12 7v14M12 7H8.5a2 2 0 110-4C11 3 12 7 12 7Zm0 0h3.5a2 2 0 100-4C13 3 12 7 12 7Z"
        />
      </>
    ),
    cake: (
      <>
        <path {...p} fill="#ffc9b5" d="M4 12h16v9H4z" />
        <path {...p} fill="#fff" d="M4 13c2 2 3-1 5 0s3 2 5 0 4 0 6-1V9H4Z" />
        <path {...p} d="M8 9V5m4 4V4m4 5V5" />
      </>
    ),
    knife: (
      <>
        <path {...p} fill="#e7eef0" d="M4 5c7 0 11 2.8 14 7H4Z" />
        <path {...p} d="M18 12v7h2v-7Z" />
      </>
    ),
    replay: (
      <>
        <path {...p} d="M5 8v5h5" />
        <path {...p} d="M6 17a8 8 0 10-.7-8L5 13" />
      </>
    ),
    sound: (
      <>
        <path {...p} fill="#fff" d="M4 10h4l5-4v12l-5-4H4Z" />
        <path {...p} d="M16 9c1.5 1.5 1.5 4.5 0 6m3-9c3.2 3.2 3.2 8.8 0 12" />
      </>
    ),
  };
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size}>
      {art[name]}
    </svg>
  );
}

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Box(
  props: ThreeElements["mesh"] & {
    color: string;
    radius?: number;
    size?: [number, number, number];
  },
) {
  const { color, radius = 0.14, size = [1, 1, 1], ...rest } = props;
  return (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={2}
      castShadow
      receiveShadow
      dispose={null}
      {...rest}
    >
      <primitive attach="material" object={sharedMaterial(color)} />
    </RoundedBox>
  );
}

function WorldLights() {
  return (
    <>
      <hemisphereLight intensity={1.45} color="#fff7e8" groundColor="#a9c9c3" />
      <directionalLight
        castShadow
        position={[7, 12, 8]}
        intensity={2}
        color="#fff4dc"
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-16, 16, 16, -16, 0.1, 60]} />
      </directionalLight>
    </>
  );
}

function CameraLook({ at = [0, 0, 0] }: { at?: [number, number, number] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(...at);
    camera.updateProjectionMatrix();
  }, [at, camera]);
  return null;
}

function Cloud3D({
  position,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const instances = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = instances.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const puffs = [
      [0, 0, 0, 1.2],
      [1, 0.08, 0, 0.85],
      [-1, -0.05, 0, 0.75],
      [0.2, 0.5, 0, 0.8],
    ];
    puffs.forEach((v, i) => {
      dummy.position.set(v[0], v[1], v[2]);
      dummy.scale.setScalar(v[3]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame((_, delta) => {
    if (group.current)
      group.current.position.x += Math.sin(performance.now() * 0.00012 * speed) * delta * 0.12;
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <instancedMesh ref={instances} args={[undefined, undefined, 4]} frustumCulled dispose={null}>
        <sphereGeometry args={[1, 10, 7]} />
        <primitive attach="material" object={sharedMaterial("#fffdf5", true)} />
      </instancedMesh>
    </group>
  );
}

function PartyHat({ type }: { type: number }) {
  if (!type) return null;
  if (type === 1)
    return (
      <group position={[0, 1.05, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.48, 1.15, 24]} />
          <meshStandardMaterial color={COLORS.pink} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color={COLORS.yellow} />
        </mesh>
      </group>
    );
  if (type === 2)
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.54, 0.45, 0.45, 8]} />
          <meshStandardMaterial color={COLORS.yellow} />
        </mesh>
        {[-0.34, 0, 0.34].map((x) => (
          <mesh key={x} position={[x, 0.34, 0]} castShadow>
            <coneGeometry args={[0.16, 0.48, 6]} />
            <meshStandardMaterial color={COLORS.yellow} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group position={[0, 0.92, 0.05]}>
      <mesh castShadow>
        <sphereGeometry args={[0.58, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.blue} />
      </mesh>
      <Box color="#69b8e9" size={[0.75, 0.09, 0.38]} radius={0.05} position={[0, -0.02, 0.42]} />
    </group>
  );
}

function Hair({ type }: { type: number }) {
  if (!type) return null;
  return (
    <group position={[0, 0.48, -0.02]}>
      <mesh scale={[1.03, type === 2 ? 0.72 : 0.5, 1.03]} castShadow>
        <sphereGeometry args={[0.61, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5d4439" roughness={0.95} />
      </mesh>
      {type === 2 &&
        [-0.48, 0.48].map((x) => (
          <mesh key={x} position={[x, -0.38, -0.1]} castShadow>
            <sphereGeometry args={[0.18, 14, 10]} />
            <meshStandardMaterial color="#5d4439" />
          </mesh>
        ))}
    </group>
  );
}

function Knife3D() {
  return (
    <group rotation={[0, 0, 0.08]}>
      <Box color={COLORS.mint} size={[0.34, 0.72, 0.32]} radius={0.12} position={[0, 0.1, 0]} />
      <mesh position={[0, -0.68, 0]} castShadow>
        <boxGeometry args={[0.12, 0.95, 0.5]} />
        <meshStandardMaterial color="#dfe8ec" roughness={0.28} metalness={0.45} />
      </mesh>
      <mesh position={[0, -1.17, 0]}>
        <coneGeometry args={[0.26, 0.28, 4]} />
        <meshStandardMaterial color="#dfe8ec" roughness={0.28} metalness={0.45} />
      </mesh>
    </group>
  );
}

function InstancedSparkle({
  count = 12,
  scale = 1,
  color = COLORS.yellow,
}: {
  count?: number;
  scale?: number;
  color?: string;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const age = useRef(0);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        speed: 0.35 + (i % 4) * 0.08,
        lift: 0.15 + (i % 3) * 0.09,
      })),
    [count],
  );
  useFrame((_, delta) => {
    const target = mesh.current;
    if (!target) return;
    age.current = (age.current + delta) % 1.2;
    const dummy = new THREE.Object3D();
    seeds.forEach((seed, i) => {
      const r = (0.18 + age.current * seed.speed) * scale;
      dummy.position.set(
        Math.cos(seed.angle) * r,
        age.current * seed.lift,
        Math.sin(seed.angle) * r,
      );
      const s = Math.max(0.02, (1 - age.current / 1.2) * 0.11 * scale);
      dummy.scale.setScalar(s);
      dummy.rotation.set(age.current * 2, seed.angle, 0);
      dummy.updateMatrix();
      target.setMatrixAt(i, dummy.matrix);
    });
    target.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

function Character3D({
  config = DEFAULT_CONFIG,
  action = "idle",
  jumpPhase = 0,
  jumpProgress,
  cuttingProgress,
  scale = 1,
  blinkOffset = 0,
}: {
  config?: Config;
  action?: Action;
  jumpPhase?: number;
  jumpProgress?: React.MutableRefObject<number>;
  cuttingProgress?: React.MutableRefObject<number>;
  scale?: number;
  blinkOffset?: number;
}) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime + blinkOffset;
    if (
      !root.current ||
      !torso.current ||
      !head.current ||
      !leftArm.current ||
      !rightArm.current ||
      !leftLeg.current ||
      !rightLeg.current
    )
      return;
    const speed = action === "run" ? 8 : 1.5;
    const swing = reduced ? 0 : Math.sin(t * speed);
    const breathe = reduced ? 0 : Math.sin(t * 1.7) * 0.025;
    root.current.position.y = action === "idle" ? breathe : 0;
    torso.current.scale.y = 1 + breathe;
    head.current.lookAt(camera.position);
    head.current.rotateZ(action === "idle" ? Math.sin(t * 0.7) * 0.045 : 0);
    const limb = action === "run" ? 0.72 : action === "cheer" ? 0.2 : 0.09;
    leftArm.current.rotation.x = swing * limb;
    rightArm.current.rotation.x = -swing * limb;
    leftLeg.current.rotation.x = -swing * (action === "run" ? 0.65 : 0.025);
    rightLeg.current.rotation.x = swing * (action === "run" ? 0.65 : 0.025);
    torso.current.rotation.x = action === "run" ? -0.14 : 0;
    if (action === "cheer") {
      leftArm.current.rotation.z = 2.5;
      rightArm.current.rotation.z = -2.5;
      root.current.position.y = Math.abs(Math.sin(t * 3.5)) * 0.15;
    } else if (action === "wave") {
      leftArm.current.rotation.z = 2.35 + Math.sin(t * 2.5) * 0.22;
      rightArm.current.rotation.z = -0.15 + Math.sin(t * 1.6 + blinkOffset) * 0.12;
    } else {
      leftArm.current.rotation.z = 0.05;
      rightArm.current.rotation.z = -0.05;
    }
    if (action === "jump") {
      const phase = jumpProgress?.current ?? jumpPhase;
      const crouch = phase < 0.16 ? Math.sin((phase / 0.16) * Math.PI) * 0.16 : 0;
      const land = phase > 0.82 ? Math.sin(((phase - 0.82) / 0.18) * Math.PI) * 0.12 : 0;
      const stretch = phase > 0.2 && phase < 0.72 ? 0.1 : 0;
      root.current.scale.set(
        1 - stretch * 0.25 + land,
        1 + stretch - crouch - land * 0.45,
        1 - stretch * 0.25 + land,
      );
      leftArm.current.rotation.x = -0.65;
      rightArm.current.rotation.x = -0.65;
      leftLeg.current.rotation.x = 0.22;
      rightLeg.current.rotation.x = 0.22;
    } else root.current.scale.set(1, 1, 1);
    if (cuttingProgress) {
      const cut = ease(cuttingProgress.current);
      rightArm.current.rotation.x = THREE.MathUtils.lerp(-0.18, 1.02, cut);
      rightArm.current.rotation.z = THREE.MathUtils.lerp(-0.35, -0.08, cut);
    }
  });
  const skin = SKINS[config.skin];
  return (
    <group ref={root} scale={scale}>
      <group ref={torso} position={[0, 1.8, 0]}>
        <Box color={SHIRTS[config.shirt]} size={[1.15, 1.25, 0.62]} radius={0.18} />
        <group ref={head} position={[0, 1.25, 0]}>
          <Box color={skin} size={[1.15, 1.05, 1]} radius={0.26} />
          <Hair type={config.hair} />
          <PartyHat type={config.hat} />
          <group position={[0, 0.1, 0.515]}>
            {[-0.39, 0.39].map((x) => (
              <mesh key={x} position={[x, -0.12, 0.015]} scale={[1, 0.55, 0.35]}>
                <sphereGeometry args={[0.105, 9, 7]} />
                <meshStandardMaterial color="#ef91a3" transparent opacity={0.72} />
              </mesh>
            ))}
          </group>
        </group>
        <group ref={leftArm} position={[-0.72, 0.48, 0]}>
          <Box
            color={SHIRTS[config.shirt]}
            size={[0.38, 0.72, 0.42]}
            radius={0.14}
            position={[0, -0.31, 0]}
          />
          <Box color={skin} size={[0.38, 0.55, 0.42]} radius={0.14} position={[0, -0.92, 0]} />
        </group>
        <group ref={rightArm} position={[0.72, 0.48, 0]}>
          <Box
            color={SHIRTS[config.shirt]}
            size={[0.38, 0.72, 0.42]}
            radius={0.14}
            position={[0, -0.31, 0]}
          />
          <Box color={skin} size={[0.38, 0.55, 0.42]} radius={0.14} position={[0, -0.92, 0]} />
          {cuttingProgress && (
            <group position={[0, -1.42, 0.08]} rotation={[0, 0, 0]}>
              <Knife3D />
              {cuttingProgress.current < 0.24 && <InstancedSparkle count={8} scale={0.7} />}
            </group>
          )}
        </group>
        <group ref={leftLeg} position={[-0.32, -0.72, 0]}>
          <Box color="#607c91" size={[0.48, 1.15, 0.55]} radius={0.14} position={[0, -0.52, 0]} />
        </group>
        <group ref={rightLeg} position={[0.32, -0.72, 0]}>
          <Box color="#607c91" size={[0.48, 1.15, 0.55]} radius={0.14} position={[0, -0.52, 0]} />
        </group>
      </group>
    </group>
  );
}

function Pet3D({
  type = 0,
  action = "idle",
  scale = 1,
}: {
  type?: number;
  action?: Action;
  scale?: number;
}) {
  const root = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    if (root.current)
      root.current.position.y =
        Math.abs(Math.sin(t * (action === "run" ? 7 : 2.2))) * (action === "run" ? 0.14 : 0.035);
    if (tail.current) tail.current.rotation.z = Math.sin(t * (action === "run" ? 10 : 5)) * 0.65;
    if (head.current) head.current.lookAt(camera.position);
  });
  const color = PETS[type];
  return (
    <group ref={root} scale={scale}>
      <Box color={color} size={[0.95, 0.7, 1.25]} radius={0.28} position={[0, 0.72, 0]} />
      <group ref={head} position={[0, 1.2, 0.65]}>
        <Box color={color} size={[0.9, 0.82, 0.75]} radius={0.28} />
        <mesh position={[0, -0.14, 0.42]}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial color="#5e4a42" />
        </mesh>
        {[-0.35, 0.35].map((x) => (
          <mesh key={`cheek-${x}`} position={[x, -0.12, 0.39]} scale={[1, 0.55, 0.4]}>
            <sphereGeometry args={[0.085, 8, 6]} />
            <meshStandardMaterial color="#ef91a3" transparent opacity={0.75} />
          </mesh>
        ))}
        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, 0.42, 0]} rotation={[0, 0, x]} castShadow>
            <coneGeometry args={[0.2, 0.48, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </group>
      {[-0.3, 0.3].map((x) => (
        <Box
          key={x}
          color={color}
          size={[0.28, 0.6, 0.3]}
          radius={0.12}
          position={[x, 0.3, 0.25]}
        />
      ))}
      <group ref={tail} position={[0, 0.9, -0.65]} rotation={[0.4, 0, 0]}>
        <Box color={color} size={[0.22, 0.22, 0.85]} radius={0.1} position={[0, 0, -0.35]} />
      </group>
    </group>
  );
}

function Cake3D({
  big = false,
  candlesLit = [true, true, true],
  sliced = false,
}: {
  big?: boolean;
  candlesLit?: boolean[];
  sliced?: boolean;
}) {
  const s = big ? 1.25 : 1;
  return (
    <group scale={s}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.55, 1.25, 32, 1]} />
        <meshStandardMaterial color={COLORS.pink} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.22, 32]} />
        <meshStandardMaterial color="#fff1d3" roughness={0.75} />
      </mesh>
      {candlesLit.map((lit, i) => (
        <group key={i} position={[(i - (candlesLit.length - 1) / 2) * 0.55, 1.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.8, 12]} />
            <meshStandardMaterial color={i % 2 ? COLORS.blue : COLORS.yellow} />
          </mesh>
          {lit && (
            <mesh position={[0, 0.52, 0]}>
              <sphereGeometry args={[0.13, 12, 8]} />
              <meshStandardMaterial color="#ffd46d" emissive="#ffba52" emissiveIntensity={1.7} />
            </mesh>
          )}
        </group>
      ))}
      {sliced && (
        <group position={[1.9, -0.15, 0.6]} rotation={[0, -0.25, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.5, 1.55, 1.25, 32, 1, false, 0, 0.75]} />
            <meshStandardMaterial color="#ffd1dc" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Gift3D({ open = false }: { open?: boolean }) {
  return (
    <group>
      <Box color={COLORS.pink} size={[2.4, 1.9, 2.2]} radius={0.2} />
      <Box color={COLORS.yellow} size={[0.38, 2.02, 2.28]} radius={0.06} />
      <Box color={COLORS.yellow} size={[2.48, 2.02, 0.38]} radius={0.06} />
      <group position={[0, open ? 2.2 : 1.12, open ? -0.6 : 0]} rotation={[open ? -0.45 : 0, 0, 0]}>
        <Box color="#f8bad0" size={[2.65, 0.38, 2.42]} radius={0.12} />
        <mesh position={[-0.5, 0.35, 0]} rotation={[0, 0, -0.7]}>
          <torusGeometry args={[0.42, 0.13, 10, 20]} />
          <meshStandardMaterial color={COLORS.yellow} />
        </mesh>
        <mesh position={[0.5, 0.35, 0]} rotation={[0, 0, 0.7]}>
          <torusGeometry args={[0.42, 0.13, 10, 20]} />
          <meshStandardMaterial color={COLORS.yellow} />
        </mesh>
      </group>
    </group>
  );
}

function FloatingIsland({
  position,
  color,
  kind,
}: {
  position: THREE.Vector3;
  color: string;
  kind?: Surprise;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[3.8, 0.65, 3.2]} radius={0.45} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={color} roughness={0.82} />
      </RoundedBox>
      <mesh position={[0, -0.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.75, 2.2, 8]} />
        <meshStandardMaterial color="#dcb58d" roughness={0.9} />
      </mesh>
      {kind === "gift" && (
        <group position={[0, 1.25, 0]} scale={0.55}>
          <Gift3D />
        </group>
      )}
      {kind === "candles" && (
        <group position={[0, 0.55, 0]} scale={0.5}>
          <Cake3D candlesLit={[false, false, false]} />
        </group>
      )}
      {!kind && (
        <>
          {[-1, 1].map((x, i) => (
            <mesh key={x} position={[x, 0.55, i ? -0.7 : 0.6]} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 1.3, 16]} />
              <meshStandardMaterial color="#fff" />
              <mesh position={[0, 0.45, 0]}>
                <sphereGeometry args={[0.32, 16, 12]} />
                <meshStandardMaterial color={i ? COLORS.pink : COLORS.blue} />
              </mesh>
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function SceneCanvas({
  children,
  camera = [6, 5, 9],
  className = "",
}: {
  children: React.ReactNode;
  camera?: [number, number, number];
  className?: string;
}) {
  return (
    <div className={`scene-canvas ${className}`}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: camera, fov: 42, near: 0.1, far: 150 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

function TitleScene() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.16 - 0.25;
  });
  return (
    <>
      <color attach="background" args={[COLORS.sky]} />
      <fog attach="fog" args={[COLORS.sky, 14, 34]} />
      <WorldLights />
      <CameraLook at={[0, -0.5, 0]} />
      <Cloud3D position={[-7, 4, -5]} scale={1.4} />
      <Cloud3D position={[7, 6, -12]} scale={1.9} speed={0.7} />
      <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.35}>
        <group ref={group} position={[0, -2.25, 0]}>
          <FloatingIsland position={PATH[0]} color={COLORS.mint} />
          <group position={[-0.6, 0.35, 0.1]}>
            <Character3D scale={0.9} />
          </group>
          <group position={[1.05, 0.25, 0.7]}>
            <Pet3D scale={0.65} type={2} />
          </group>
          <group position={[-2, 0.8, -0.7]} scale={0.48}>
            <Cake3D />
          </group>
        </group>
      </Float>
    </>
  );
}

function CreatorScene({ config, pop }: { config: Config; pop: number }) {
  const turntable = useRef<THREE.Group>(null);
  const bounce = useRef(0);
  useEffect(() => {
    bounce.current = 1;
  }, [pop]);
  useFrame(({ clock }, delta) => {
    if (turntable.current) {
      turntable.current.rotation.y = Math.sin(clock.elapsedTime * 0.38) * 0.28 - 0.25;
      bounce.current = Math.max(0, bounce.current - delta * 2.8);
      turntable.current.position.y = Math.sin(bounce.current * Math.PI) * 0.32;
    }
  });
  return (
    <>
      <color attach="background" args={["#dff4f6"]} />
      <WorldLights />
      <CameraLook at={[0, 0.1, 0]} />
      <Cloud3D position={[-6, 4, -6]} />
      <group ref={turntable} position={[-0.3, -1.7, 0]}>
        <Character3D config={config} />
        <group position={[1.45, 0, 0.55]}>
          <Pet3D type={config.pet} scale={0.72} />
        </group>
      </group>
      <mesh position={[0, -1.95, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.8, 0.45, 48]} />
        <meshStandardMaterial color="#b5dfe4" roughness={0.65} />
      </mesh>
    </>
  );
}

function CourseMover({
  config,
  step,
  moving,
  onArrive,
}: {
  config: Config;
  step: number;
  moving: boolean;
  onArrive: () => void;
}) {
  const root = useRef<THREE.Group>(null);
  const pet = useRef<THREE.Group>(null);
  const bubble = useRef<THREE.Mesh>(null);
  const progress = useRef(1);
  const from = useRef(PATH[0].clone());
  const arrived = useRef(0);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const behind = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const lead = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const cameraLook = useRef(PATH[0].clone().add(new THREE.Vector3(0, 1.25, 0)));
  const { camera } = useThree();
  useEffect(() => {
    if (moving) {
      from.current.copy(root.current?.position || PATH[Math.max(0, step - 1)]);
      progress.current = 0;
    }
  }, [step, moving]);
  useFrame((_, delta) => {
    if (!root.current || !pet.current) return;
    const target = PATH[step];
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / 0.9);
      const p = ease(progress.current);
      root.current.position.lerpVectors(from.current, target, p);
      root.current.position.y += Math.sin(p * Math.PI) * 2.25;
      direction.copy(target).sub(from.current);
      root.current.rotation.y = Math.atan2(direction.x, direction.z);
      const pp = ease(Math.max(0, progress.current - 0.11));
      pet.current.position.lerpVectors(from.current, target, pp);
      pet.current.position.y += Math.sin(pp * Math.PI) * 1.75;
      pet.current.rotation.y = root.current.rotation.y;
      if (bubble.current) {
        bubble.current.visible = step % 4 === 0 && p > 0.52 && p < 0.84;
        bubble.current.position.copy(root.current.position);
      }
      if (progress.current === 1 && arrived.current !== step) {
        arrived.current = step;
        onArrive();
      }
    } else {
      root.current.position.lerp(target, 1 - Math.exp(-delta * 9));
      behind.set(0.7, 0, 1.25).applyAxisAngle(up, root.current.rotation.y).add(target);
      pet.current.position.lerp(behind, 1 - Math.exp(-delta * 5));
    }
    const current = root.current.position;
    const next = PATH[Math.min(step + 1, PATH.length - 1)];
    lead.copy(current).lerp(next, 0.32);
    tangent.copy(next).sub(current).normalize();
    side.set(-tangent.z, 0, tangent.x);
    desired.copy(current).add(side.multiplyScalar(4.4));
    desired.y += 4.1;
    desired.z += 6.8;
    camera.position.lerp(desired, 1 - Math.exp(-delta * 2.2));
    lead.y += 1.25;
    cameraLook.current.lerp(lead, 1 - Math.exp(-delta * 3));
    camera.lookAt(cameraLook.current);
  });
  return (
    <>
      <group ref={root} position={PATH[0]}>
        <Character3D
          config={config}
          action={moving ? "jump" : "idle"}
          jumpProgress={progress}
          scale={0.72}
        />
        {moving && <InstancedSparkle count={10} scale={1.2} />}
      </group>
      <group ref={pet} position={[0.8, 0, 1.1]}>
        <Pet3D type={config.pet} action={moving ? "run" : "idle"} scale={0.55} />
      </group>
      <mesh ref={bubble} visible={false}>
        <sphereGeometry args={[1.25, 12, 8]} />
        <meshPhysicalMaterial
          color="#bcefff"
          transparent
          opacity={0.2}
          roughness={0.05}
          transmission={0.35}
        />
      </mesh>
    </>
  );
}

function ObbyScene({
  config,
  step,
  moving,
  onArrive,
}: {
  config: Config;
  step: number;
  moving: boolean;
  onArrive: () => void;
}) {
  return (
    <>
      <color attach="background" args={[COLORS.sky]} />
      <fog attach="fog" args={[COLORS.sky, 18, 72]} />
      <WorldLights />
      {PATH.map((p, i) => (
        <FloatingIsland
          key={i}
          position={p}
          color={PALETTE[i % PALETTE.length]}
          kind={i === 3 ? "gift" : i === 9 ? "candles" : undefined}
        />
      ))}
      <CourseMover config={config} step={step} moving={moving} onArrive={onArrive} />
      <Cloud3D position={[-8, 5, -8]} scale={1.4} />
      <Cloud3D position={[8, 8, -22]} scale={2} speed={0.6} />
      <Cloud3D position={[-9, 9, -38]} scale={2.4} speed={0.4} />
      {[
        [-7, 1, -17],
        [8, 4, -29],
        [-8, 5, -42],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow>
            <torusGeometry args={[0.6, 0.18, 12, 24]} />
            <meshStandardMaterial color={PALETTE[i + 2]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function BalloonInstances({
  popped,
  onPop,
}: {
  popped: boolean[];
  onPop: (index: number) => void;
}) {
  const balloons = useRef<Array<THREE.Mesh | null>>([]);
  const time = useRef(0);
  useFrame((_, delta) => {
    time.current += delta;
    popped.forEach((isPopped, i) => {
      const balloon = balloons.current[i];
      if (!balloon) return;
      balloon.visible = !isPopped;
      balloon.position.y = (i % 2) * 0.7 + 0.4 + Math.sin(time.current + i) * 0.12;
    });
  });
  return (
    <group>
      {PALETTE.map((color, i) => (
        <mesh
          key={color}
          ref={(node) => {
            balloons.current[i] = node;
          }}
          position={[(i - 2) * 1.2, (i % 2) * 0.7 + 0.4, 0]}
          scale={[0.72, 0.9, 0.72]}
          onClick={(event) => {
            event.stopPropagation();
            if (!popped[i]) onPop(i);
          }}
        >
          <sphereGeometry args={[0.7, 10, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function SurpriseScene({
  type,
  open,
  popped,
  lit,
  onMesh,
}: {
  type: Exclude<Surprise, null>;
  open: boolean;
  popped: boolean[];
  lit: boolean[];
  onMesh: (i?: number) => void;
}) {
  const cameraRig = useRef<THREE.Group>(null);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, delta) => {
    cameraTarget.set(open ? 4.8 : 6, open ? 3.3 : 4.8, open ? 6.2 : 8);
    camera.position.lerp(cameraTarget, 1 - Math.exp(-delta * 2.4));
    camera.lookAt(0, 0.7, 0);
    if (cameraRig.current) cameraRig.current.rotation.y += delta * 0.12;
  });
  return (
    <>
      <color attach="background" args={["#e5f5f2"]} />
      <WorldLights />
      <group ref={cameraRig} position={[0, -1, 0]}>
        {type === "gift" && (
          <group onClick={() => onMesh()}>
            <Gift3D open={open} />
            {open && <InstancedSparkle count={16} scale={3} />}
          </group>
        )}
        {type === "balloons" && <BalloonInstances popped={popped} onPop={(i) => onMesh(i)} />}
        {type === "candles" && (
          <group position={[0, -0.25, 0]}>
            <Cake3D candlesLit={lit} />
            {lit.map((_, i) => (
              <mesh
                key={i}
                position={[(i - 1) * 0.55, 1.25, 0.35]}
                onClick={(e) => {
                  e.stopPropagation();
                  onMesh(i);
                }}
              >
                <boxGeometry args={[0.52, 1.6, 0.9]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </>
  );
}

function FinaleCamera({ stage }: { stage: FinaleStage }) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const look = useRef(new THREE.Vector3(0, 1.5, 0));
  const idleLook = useMemo(() => new THREE.Vector3(0, 1.55, 0), []);
  const cutLook = useMemo(() => new THREE.Vector3(0, 1.35, 0.5), []);
  useFrame((_, delta) => {
    elapsed.current += delta;
    const intro = Math.min(1, elapsed.current / 6);
    const beforeCut = stage === "candles" || stage === "ready";
    desired.set(
      beforeCut ? 0 : 2.2,
      THREE.MathUtils.lerp(5.4, beforeCut ? 4.3 : 3.5, ease(intro)),
      THREE.MathUtils.lerp(14.5, beforeCut ? 10.8 : 8.5, ease(intro)),
    );
    camera.position.lerp(desired, 1 - Math.exp(-delta * 1.65));
    look.current.lerp(beforeCut ? idleLook : cutLook, 1 - Math.exp(-delta * 2));
    camera.lookAt(look.current);
  });
  return null;
}

function Baby3D() {
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const smile = useRef<THREE.Mesh>(null);
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    if (head.current) head.current.lookAt(camera.position);
    if (eyes.current) eyes.current.scale.y = Math.sin(t * 0.61) > 0.988 ? 0.1 : 1;
    if (smile.current) {
      const size = Math.sin(t * 0.29) > 0.88 ? 1.25 : 1;
      smile.current.scale.setScalar(size);
    }
  });
  return (
    <group>
      <Box color={COLORS.mint} size={[0.8, 0.85, 0.55]} radius={0.22} />
      <group ref={head} position={[0, 0.56, 0.12]}>
        <mesh>
          <sphereGeometry args={[0.31, 10, 8]} />
          <primitive attach="material" object={sharedMaterial(SKINS[0])} />
        </mesh>
        <group ref={eyes}>
          {[-0.11, 0.11].map((x) => (
            <mesh key={x} position={[x, 0.05, 0.285]}>
              <sphereGeometry args={[0.042, 7, 5]} />
              <meshBasicMaterial color="#344b59" />
              <mesh position={[-0.012, 0.014, 0.035]}>
                <sphereGeometry args={[0.012, 5, 4]} />
                <meshBasicMaterial color="white" />
              </mesh>
            </mesh>
          ))}
        </group>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, -0.05, 0.275]} scale={[1, 0.55, 0.4]}>
            <sphereGeometry args={[0.045, 7, 5]} />
            <meshStandardMaterial color="#ef91a3" transparent opacity={0.72} />
          </mesh>
        ))}
        <mesh ref={smile} position={[0, -0.07, 0.29]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.07, 0.018, 5, 10, Math.PI]} />
          <meshStandardMaterial color="#995d58" />
        </mesh>
      </group>
    </group>
  );
}

function FinaleCake({
  progress,
  candlesLit,
}: {
  progress: React.MutableRefObject<number>;
  candlesLit: boolean;
}) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame(() => {
    const split = ease(Math.max(0, (progress.current - 0.56) / 0.44));
    if (left.current) {
      left.current.position.x = -split * 0.22;
      left.current.rotation.z = split * 0.035;
    }
    if (right.current) {
      right.current.position.x = split * 0.72;
      right.current.position.z = split * 0.28;
      right.current.rotation.z = -split * 0.08;
    }
  });
  const half = (start: number) => (
    <>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.55, 1.6, 1.25, 18, 1, false, start, Math.PI]} />
        <primitive attach="material" object={sharedMaterial(COLORS.blue)} />
      </mesh>
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[1.55, 1.55, 0.18, 18, 1, false, start, Math.PI]} />
        <primitive attach="material" object={sharedMaterial("#fff1d3")} />
      </mesh>
    </>
  );
  return (
    <group>
      <group ref={left}>{half(0)}</group>
      <group ref={right}>{half(Math.PI)}</group>
      {[-0.72, -0.24, 0.24, 0.72].map((x, i) => (
        <group key={x} position={[x, 1.2, -0.05]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.78, 8]} />
            <primitive
              attach="material"
              object={sharedMaterial(i % 2 ? COLORS.blue : COLORS.yellow)}
            />
          </mesh>
          {candlesLit && (
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.11, 8, 6]} />
              <meshStandardMaterial color="#ffd46d" emissive="#ffba52" emissiveIntensity={0.55} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Confetti3D() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);
  const pieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        x: ((i * 37) % 100) / 10 - 5,
        z: ((i * 53) % 70) / 10 - 2,
        delay: 1.2 + (i % 8) * 0.13,
        speed: 0.7 + (i % 5) * 0.1,
      })),
    [],
  );
  useEffect(() => {
    if (!mesh.current) return;
    PALETTE.forEach((color, i) => mesh.current!.setColorAt(i, new THREE.Color(color)));
    for (let i = PALETTE.length; i < pieces.length; i++)
      mesh.current.setColorAt(i, new THREE.Color(PALETTE[i % PALETTE.length]));
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [pieces.length]);
  useFrame((_, delta) => {
    const target = mesh.current;
    if (!target) return;
    time.current += delta;
    const dummy = new THREE.Object3D();
    pieces.forEach((piece, i) => {
      const local = Math.max(0, time.current - piece.delay);
      const y = 7 - ((local * piece.speed) % 8);
      dummy.position.set(piece.x + Math.sin(local + i) * 0.18, y, piece.z);
      dummy.rotation.set(local * 1.4, local * 1.8 + i, 0);
      dummy.scale.set(0.08, 0.18, 0.04);
      dummy.updateMatrix();
      target.setMatrixAt(i, dummy.matrix);
    });
    target.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 32]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  );
}

function ToyCarRide({ config, stage }: { config: Config; stage: FinaleStage }) {
  const car = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  const ride = useRef(stage === "done" ? 1 : 0);
  useEffect(() => {
    if (stage === "ride") ride.current = 0;
  }, [stage]);
  useFrame((_, delta) => {
    if (stage === "ride") ride.current = Math.min(1, ride.current + delta / 4.7);
    const move = ease(ride.current);
    if (car.current) {
      car.current.visible = stage !== "done";
      car.current.position.set(3.7, 0, THREE.MathUtils.lerp(1.2, -16, move));
      car.current.rotation.y = Math.PI / 2;
    }
    if (wheels.current) wheels.current.rotation.z -= delta * (stage === "ride" ? 8 : 0);
  });
  const riding = stage === "ride" || stage === "done";
  return (
    <group ref={car} position={[3.7, 0, 1.2]} scale={0.82}>
      {riding && (
        <group position={[0, 0.28, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Character3D config={config} action="idle" scale={0.38} />
        </group>
      )}
      <Box color={COLORS.blue} size={[2.6, 0.72, 1.45]} radius={0.25} position={[0, 0.58, 0]} />
      <Box color="#e8f5f7" size={[1.15, 0.72, 1.16]} radius={0.2} position={[0.25, 1.14, 0]} />
      <Box
        color={COLORS.yellow}
        size={[0.18, 0.85, 1.52]}
        radius={0.05}
        position={[-0.45, 0.65, 0]}
      />
      {[
        [-0.82, -0.68],
        [0.82, -0.68],
        [-0.82, 0.68],
        [0.82, 0.68],
      ].map(([x, z], i) => (
        <group ref={i === 0 ? wheels : undefined} key={`${x}-${z}`} position={[x, 0.25, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.2, 12]} />
            <meshStandardMaterial color="#526776" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <group position={[-0.45, 1.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.1, 7, 14]} />
          <primitive attach="material" object={sharedMaterial(COLORS.pink)} />
        </mesh>
      </group>
    </group>
  );
}

function FinaleScene({
  config,
  stage,
  onComplete,
}: {
  config: Config;
  stage: FinaleStage;
  onComplete: () => void;
}) {
  const cutProgress = useRef(stage === "ride" || stage === "done" ? 1 : 0);
  const completed = useRef(false);
  useEffect(() => {
    if (stage === "cutting") {
      cutProgress.current = 0;
      completed.current = false;
    }
  }, [stage]);
  useFrame((_, delta) => {
    if (stage !== "cutting") return;
    cutProgress.current = Math.min(1, cutProgress.current + delta / 2.35);
    if (cutProgress.current === 1 && !completed.current) {
      completed.current = true;
      onComplete();
    }
  });
  return (
    <>
      <color attach="background" args={["#f8ead8"]} />
      <WorldLights />
      <FinaleCamera stage={stage} />
      <Box color="#f6e3c9" size={[15, 0.5, 12]} radius={0.15} position={[0, -0.45, 0]} />
      <Box color="#dff2ee" size={[15, 7, 0.4]} radius={0.1} position={[0, 3, -4.5]} />
      {FAMILY.map(([name, shirt, hat], i) => {
        const x = (i - 1) * 2.5;
        const z = i === 1 ? -2 : -1.55;
        const isIrha = name === "Irha";
        return (
          <group key={name} position={[x, 0, z]}>
            <Character3D
              config={{
                skin: name === "Umair Baba" ? 1 : 0,
                hair: name === "Umair Baba" ? 1 : 2,
                shirt: SHIRTS.indexOf(shirt) < 0 ? i % 4 : SHIRTS.indexOf(shirt),
                hat,
                pet: 0,
              }}
              action={stage === "ride" || stage === "done" ? "cheer" : "wave"}
              scale={isIrha ? 0.36 : 0.5}
              blinkOffset={i * 0.45}
            />
          </group>
        );
      })}
      <group position={[-1.55, 0, 2.25]} rotation={[0, -Math.PI / 2, 0]}>
        <Character3D
          config={config}
          action={stage === "ride" || stage === "done" ? "cheer" : "idle"}
          cuttingProgress={stage === "cutting" ? cutProgress : undefined}
          scale={0.68}
        />
      </group>
      <group position={[0, 0, 0.8]}>
        <mesh position={[0, 0.18, 0]} receiveShadow>
          <cylinderGeometry args={[2.25, 2.25, 0.36, 24]} />
          <primitive attach="material" object={sharedMaterial("#f6d9b4")} />
        </mesh>
        <mesh position={[0, -0.55, 0]} receiveShadow>
          <cylinderGeometry args={[0.72, 0.92, 1.25, 16]} />
          <primitive attach="material" object={sharedMaterial("#e9bd91")} />
        </mesh>
        <group position={[0, 1.02, 0]}>
          <FinaleCake progress={cutProgress} candlesLit={stage === "candles"} />
        </group>
      </group>
      {(stage === "ride" || stage === "done") && <Confetti3D />}
    </>
  );
}

function SoftButton({
  children,
  onClick,
  icon,
  className = "",
  label,
}: {
  children?: React.ReactNode;
  onClick: () => void;
  icon?: string;
  className?: string;
  label?: string;
}) {
  return (
    <button className={`soft-button ${className}`} onClick={onClick} aria-label={label}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

function TitleScreen({ play }: { play: () => void }) {
  return (
    <section className="screen title-screen">
      <SceneCanvas camera={[7, 4.5, 9]}>
        <TitleScene />
      </SceneCanvas>
      <div className="logo">
        <span>Affan’s</span>
        <strong>Birthday World</strong>
        <i>
          <Icon name="cake" size={42} />
        </i>
      </div>
      <div className="title-action">
        <SoftButton icon="play" onClick={play} className="play-button">
          PLAY
        </SoftButton>
        <div className="pointing">
          <Icon name="hand" size={35} />
        </div>
      </div>
    </section>
  );
}

function ChoiceIcon({ type, value }: { type: string; value: number }) {
  if (type === "skin" || type === "shirt")
    return (
      <span
        className="swatch"
        style={{ background: type === "skin" ? SKINS[value] : SHIRTS[value] }}
      />
    );
  if (type === "hair") return <span className={`choice-hair h${value}`} />;
  if (type === "hat") return <span className={`choice-hat hat${value}`} />;
  return (
    <span className="choice-pet" style={{ background: PETS[value] }}>
      ••
    </span>
  );
}

function CreatorScreen({
  config,
  update,
  go,
}: {
  config: Config;
  update: (key: keyof Config, value: number) => void;
  go: () => void;
}) {
  const [pop, setPop] = useState(0);
  const choices: [keyof Config, number][] = [
    ["skin", 4],
    ["hair", 3],
    ["shirt", 4],
    ["hat", 4],
    ["pet", 3],
  ];
  return (
    <section className="screen creator-screen">
      <SceneCanvas camera={[6.2, 3.7, 8]}>
        <CreatorScene config={config} pop={pop} />
      </SceneCanvas>
      <header className="mini-logo">AFFAN’S WORLD</header>
      <div className="creator-ui">
        <div className="choice-panel">
          {choices.map(([key, count]) => (
            <div className="choice-row" key={key}>
              <div className={`category category-${key}`}>
                <ChoiceIcon
                  type={key}
                  value={key === "skin" || key === "shirt" ? config[key] : 1}
                />
              </div>
              <div className="choice-options">
                {Array.from({ length: count }, (_, i) => (
                  <button
                    key={i}
                    className={`choice ${config[key] === i ? "selected" : ""}`}
                    aria-label={`Choose ${key} ${i + 1}`}
                    aria-pressed={config[key] === i}
                    onClick={() => {
                      update(key, i);
                      setPop((x) => x + 1);
                    }}
                  >
                    <ChoiceIcon type={key} value={i} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <SoftButton icon="arrow" onClick={go} className="go-button">
          LET’S GO!
        </SoftButton>
      </div>
    </section>
  );
}

function SurpriseOverlay({
  type,
  close,
  addStar,
}: {
  type: Exclude<Surprise, null>;
  close: () => void;
  addStar: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [popped, setPopped] = useState([false, false, false, false, false]);
  const [lit, setLit] = useState([false, false, false]);
  const done =
    type === "gift" ? open : type === "balloons" ? popped.every(Boolean) : lit.every(Boolean);
  const interact = (i = 0) => {
    if (type === "gift") setOpen(true);
    if (type === "balloons") setPopped((v) => v.map((x, n) => (n === i ? true : x)));
    if (type === "candles") setLit((v) => v.map((x, n) => (n === i ? true : x)));
    if (type === "balloons") addStar();
  };
  return (
    <div className="surprise-overlay">
      <div className="surprise-card">
        <div className="surprise-icon">
          <Icon name={type === "gift" ? "gift" : type === "candles" ? "cake" : "hand"} size={38} />
        </div>
        <SceneCanvas camera={[6, 4.8, 8]}>
          <SurpriseScene type={type} open={open} popped={popped} lit={lit} onMesh={interact} />
        </SceneCanvas>
        {!done && (
          <div className="tap-object">
            <Icon name="hand" size={38} />
            <strong>
              {type === "gift"
                ? "TAP GIFT TO OPEN"
                : type === "balloons"
                  ? "TAP BALLOONS TO POP"
                  : "TAP CANDLES TO LIGHT"}
            </strong>
          </div>
        )}
        {type === "gift" && open && (
          <div className="message-card">
            <img className="photo-placeholder" src={affanPhoto} alt="Affan smiling" />
            <div>
              <strong>
                HAPPY BIRTHDAY
                <br />
                AFFAN!
              </strong>
              <span>We love you to the stars and back!</span>
            </div>
          </div>
        )}
        {done && (
          <SoftButton icon="arrow" onClick={close} className="surprise-next" label="Continue" />
        )}
      </div>
    </div>
  );
}

function MemoryOverlay({ type, close }: { type: Memory; close: () => void }) {
  const firstYear = type === "first-year";
  const firstSteps = type === "first-steps";
  const video =
    type === "school"
      ? schoolVideo
      : type === "school-again"
        ? schoolAgainVideo
        : type === "good-time"
          ? goodTimeVideo
          : type === "age-seven"
            ? ageSevenVideo
            : type === "final-tribute"
              ? finalTributeVideo
              : firstStepsVideo;
  const image =
    type === "age-three"
      ? ageThreePhoto
      : type === "creativity"
        ? creativityPhoto
        : type === "growing-up"
          ? growingUpPhoto
          : type === "age-six"
            ? ageSixPhoto
            : firstYearPhoto;
  return (
    <div className="surprise-overlay">
      <article className="memory-card">
        {firstSteps ||
        type === "school" ||
        type === "school-again" ||
        type === "good-time" ||
        type === "age-seven" ||
        type === "final-tribute" ? (
          <video src={video} controls autoPlay playsInline preload="metadata" />
        ) : (
          <img
            src={image}
            alt={
              firstYear
                ? "Affan during his first year"
                : type === "age-three"
                  ? "Affan at age three"
                  : type === "creativity"
                    ? "Affan being creative"
                    : type === "age-six"
                      ? "Affan at age six"
                      : "Affan learning colors"
            }
          />
        )}
        {type === "age-three" && <h2>Age 3: The Little Trouble Maker 😂</h2>}
        <p>
          {firstYear
            ? "Well, this was Affan's first year. Mostly chilling, getting carried around, and figuring out how this whole world works. But things were about to get interesting..."
            : firstSteps
              ? "And then came the day he decided walking was better than being carried"
              : type === "age-three"
                ? "By now, Affan had figured out how to walk, talk, run around and probably get into things he wasn't supposed to. Sitting still? Not really his thing."
                : type === "creativity"
                  ? "The creativity was there. The execution? Questionable."
                  : type === "school"
                    ? "Bro was living his best life until someone mentioned SCHOOL."
                    : type === "growing-up"
                      ? "Then came the growing-up phase. Learning colors, drawing masterpieces, and discovering that crayons work on walls too."
                      : type === "school-again"
                        ? "And then... school again. And again. And AGAIN. 😭 At this point, even your Phupho wanted to cry. 💀"
                        : type === "good-time"
                          ? "Not sure what was happening here, but he was clearly having a good time."
                          : type === "age-six"
                            ? "And just like that, he's 6! life was basically school, snacks and finding new ways to cause chaos."
                            : type === "age-seven"
                              ? "Age 7: Looking cooler, getting taller, and stealing everyone's spotlight. 😎."
                              : "Watched this little guy grow through all these years, and somehow he keeps getting more adorable. No matter how big you get, you'll always be our little favourite."}
        </p>
        <SoftButton icon="arrow" onClick={close} label="Continue" />
      </article>
    </div>
  );
}

function ObbyScreen({
  config,
  finish,
  sound,
}: {
  config: Config;
  finish: () => void;
  sound: (type?: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [moving, setMoving] = useState(false);
  const [coins, setCoins] = useState(0);
  const [stars, setStars] = useState(0);
  const [surprise, setSurprise] = useState<Surprise>(null);
  const [memory, setMemory] = useState<Memory | null>(null);
  const queuedJumps = useRef(0);
  const requestJump = () => {
    if (surprise || memory || step >= PATH.length - 1) return;
    if (moving) {
      queuedJumps.current = Math.min(queuedJumps.current + 1, PATH.length - 1 - step);
      sound("tap");
      return;
    }
    sound("hop");
    setStep((s) => s + 1);
    setMoving(true);
  };
  const arrived = useCallback(() => {
    setMoving(false);
    setCoins((c) => c + 1);
    if (step % 2 === 0) setStars((s) => s + 1);
    if (step === 2) {
      queuedJumps.current = 0;
      setMemory("first-year");
    } else if (step === 3) {
      queuedJumps.current = 0;
      setMemory("first-steps");
    } else if (step === 4) {
      queuedJumps.current = 0;
      setMemory("age-three");
    } else if (step === 5) {
      queuedJumps.current = 0;
      setMemory("creativity");
    } else if (step === 6) {
      queuedJumps.current = 0;
      setSurprise("balloons");
    } else if (step === 7) {
      queuedJumps.current = 0;
      setMemory("school");
    } else if (step === 8) {
      queuedJumps.current = 0;
      setMemory("growing-up");
    } else if (step === 9) {
      queuedJumps.current = 0;
      setSurprise("candles");
    } else if (step === 10) {
      queuedJumps.current = 0;
      setMemory("school-again");
    } else if (step === 11) {
      queuedJumps.current = 0;
      setMemory("good-time");
    } else if (step === 12) {
      queuedJumps.current = 0;
      setMemory("age-six");
    } else if (step === 13) {
      queuedJumps.current = 0;
      setMemory("age-seven");
    } else if (step === 14) {
      queuedJumps.current = 0;
      setMemory("final-tribute");
    } else if (step === PATH.length - 1) setTimeout(finish, 500);
    else if (queuedJumps.current > 0) {
      queuedJumps.current -= 1;
      window.setTimeout(() => {
        sound("hop");
        setStep((s) => Math.min(PATH.length - 1, s + 1));
        setMoving(true);
      }, 35);
    }
  }, [finish, sound, step]);
  return (
    <section className="screen obby-screen">
      <SceneCanvas camera={[5, 4, 8]}>
        <ObbyScene config={config} step={step} moving={moving} onArrive={arrived} />
      </SceneCanvas>
      <header className="hud">
        <div className="hud-pill">
          <Icon name="coin" />
          <strong>{coins}</strong>
        </div>
        <div className="level-dots">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} className={step / 2 >= i ? "active" : ""} />
          ))}
        </div>
        <div className="hud-pill">
          <Icon name="star" />
          <strong>{stars}</strong>
        </div>
      </header>
      <button
        className="course-tap"
        onClick={requestJump}
        aria-label="Jump forward to the next platform"
      />
      <div className="obby-prompt">
        <Icon name="hand" size={38} />
        <strong>{moving ? "FLYING!" : "TAP TO JUMP!"}</strong>
      </div>
      {surprise && (
        <SurpriseOverlay
          type={surprise}
          close={() => {
            sound("happy");
            setSurprise(null);
          }}
          addStar={() => {
            sound("pop");
            setStars((s) => s + 1);
          }}
        />
      )}
      {memory && (
        <MemoryOverlay
          type={memory}
          close={() => {
            sound("happy");
            if (memory === "first-steps") setSurprise("gift");
            setMemory(null);
          }}
        />
      )}
    </section>
  );
}

function FinaleScreen({ config, sound }: { config: Config; sound: (type?: string) => void }) {
  const [stage, setStage] = useState<FinaleStage>("candles");
  useEffect(() => {
    const track = new Audio(birthdayBackground);
    track.loop = true;
    track.volume = 0.45;
    void track.play().catch(() => undefined);
    return () => {
      track.pause();
      track.currentTime = 0;
    };
  }, []);
  useEffect(() => {
    if (stage !== "ride") return;
    const finishRide = window.setTimeout(() => {
      setStage("done");
      sound("win");
    }, 5000);
    return () => {
      window.clearTimeout(finishRide);
    };
  }, [sound, stage]);
  const blowCandles = () => {
    if (stage === "candles") {
      setStage("ready");
      sound("happy");
    }
  };
  const cutCake = () => {
    if (stage === "ready") {
      setStage("cutting");
      sound("happy");
      sound("clap");
    }
  };
  return (
    <section className="screen finale-screen">
      <SceneCanvas camera={[0, 5.4, 14.5]} className="finale-canvas">
        <FinaleScene
          config={config}
          stage={stage}
          onComplete={() => {
            setStage("ride");
          }}
        />
      </SceneCanvas>
      <header className="finale-title">
        {stage === "done" ? "" : stage === "ride" ? "HAPPY BIRTHDAY AFFAN!" : "BIRTHDAY ROOM"}
      </header>
      {stage === "candles" ? (
        <button className="cut-prompt" onClick={blowCandles}>
          <Icon name="cake" size={38} />
          <strong>TAP CAKE TO BLOW OUT!</strong>
          <Icon name="hand" size={34} />
        </button>
      ) : stage === "ready" ? (
        <button className="cut-prompt" onClick={cutCake}>
          <Icon name="knife" size={38} />
          <strong>TAP TO CUT!</strong>
          <Icon name="hand" size={34} />
        </button>
      ) : stage === "done" ? (
        <div className="birthday-pop">HAPPY BIRTHDAY AFFAN!</div>
      ) : null}
    </section>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const audio = useRef<AudioContext | null>(null);
  const sound = useCallback((type = "tap") => {
    try {
      const AC =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio.current ||= new AC();
      const ctx = audio.current;
      if (type === "clap") {
        for (let clap = 0; clap < 7; clap += 1) {
          const start = ctx.currentTime + clap * 0.32;
          const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.075), ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i += 1)
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
          const source = ctx.createBufferSource();
          const filter = ctx.createBiquadFilter();
          const clapGain = ctx.createGain();
          source.buffer = buffer;
          filter.type = "bandpass";
          filter.frequency.value = 1450;
          filter.Q.value = 0.7;
          clapGain.gain.setValueAtTime(0.0001, start);
          clapGain.gain.exponentialRampToValueAtTime(0.13, start + 0.006);
          clapGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.075);
          source.connect(filter).connect(clapGain).connect(ctx.destination);
          source.start(start);
        }
        return;
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const notes: Record<string, number[]> = {
        tap: [420],
        hop: [420, 600],
        pop: [700],
        happy: [520, 660],
        win: [440, 550, 660],
      };
      const seq = notes[type] || notes.tap;
      osc.type = "sine";
      osc.frequency.setValueAtTime(seq[0], ctx.currentTime);
      seq
        .slice(1)
        .forEach((n, i) => osc.frequency.setValueAtTime(n, ctx.currentTime + (i + 1) * 0.1));
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      /* Sound stays optional. */
    }
  }, []);
  const go = (next: Screen) => {
    sound("happy");
    setScreen(next);
  };
  return (
    <main className="game-shell">
      {screen === "title" && <TitleScreen play={() => go("creator")} />}
      {screen === "creator" && (
        <CreatorScreen
          config={config}
          update={(key, value) => {
            setConfig((c) => ({ ...c, [key]: value }));
            sound("pop");
          }}
          go={() => go("obby")}
        />
      )}
      {screen === "obby" && (
        <ObbyScreen config={config} finish={() => go("finale")} sound={sound} />
      )}
      {screen === "finale" && <FinaleScreen config={config} sound={sound} />}
      <div className="sound-chip">
        <Icon name="sound" size={20} />
      </div>
    </main>
  );
}
