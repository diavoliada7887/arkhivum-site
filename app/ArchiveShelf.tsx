"use client";

import { sitePath } from "./site-path";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";

type ShelfItem = {
  kind: "Проект";
  title: string;
  spine: string;
  detail: string;
  href: string;
  coverImage: string;
  year?: string;
};

const shelfItems: ShelfItem[] = [
  {
    kind: "Проект",
    title: "Газеты Нового Уренгоя",
    spine: "Новый Уренгой",
    detail: "Крупноформатная периодика: от цифровых полос до архивной информационной системы.",
    href: "/experience/novy-urengoy-newspapers",
    coverImage: "/assets/novy-urengoy-newspaper.webp",
  },
  {
    kind: "Проект",
    title: "«Кронштадтский вестник»",
    spine: "Кронштадт",
    detail: "Дореволюционная газета с современной навигацией и полнотекстовым поиском.",
    href: "/experience/kronstadt",
    coverImage: "/assets/kronstadt-cover.webp",
    year: "1860–1917",
  },
  {
    kind: "Проект",
    title: "Петербургская театральная библиотека",
    spine: "Театральная библиотека",
    detail: "Работа с редкими изданиями, отдельные экземпляры которых датируются 1730 годом.",
    href: "/experience/theater-library",
    coverImage: "/assets/theater-library-1789.webp",
    year: "с 1730",
  },
  {
    kind: "Проект",
    title: "180 343 скана редких книг",
    spine: "180 343 скана",
    detail: "Большой массив редких изданий оцифрован без вывоза из фонда.",
    href: "/experience/rare-books",
    coverImage: "/assets/rare-book-open.webp",
  },
  {
    kind: "Проект",
    title: "Книга 1945 года",
    spine: "Издание 1945",
    detail: "Сканирование исторического издания с сохранением водяных знаков и деталей экземпляра.",
    href: "/experience/book-1945",
    coverImage: "/assets/book-1945-cover.webp",
    year: "1945",
  },
  {
    kind: "Проект",
    title: "Архив Шали",
    spine: "Архив Шали",
    detail: "Полный цикл: от скана документа до записи в информационной системе.",
    href: "/experience/shalya",
    coverImage: "/assets/shalya-database.webp",
  },
  {
    kind: "Проект",
    title: "Саратов: 888 дел",
    spine: "Саратов",
    detail: "Договоры социального найма оцифрованы и приведены к архивному порядку.",
    href: "/experience/saratov",
    coverImage: "/assets/saratov-archive.webp",
    year: "888 дел",
  },
  {
    kind: "Проект",
    title: "Глазов: до 1 000 страниц в час",
    spine: "Глазов",
    detail: "Поточная линия оцифровки с высокой производительностью и поэтапным контролем.",
    href: "/experience/glazov",
    coverImage: "/assets/mass-paper-backlog-real.webp",
  },
  {
    kind: "Проект",
    title: "Тюменский ЗАГС",
    spine: "Тюменский ЗАГС",
    detail: "Подготовка документов к длительному хранению и дальнейшей цифровой работе.",
    href: "/experience/tyumen-zags",
    coverImage: "/assets/archive-ordering-work.jpg",
  },
  {
    kind: "Проект",
    title: "Поточное наполнение базы",
    spine: "5 000 карточек",
    detail: "До 5 000 проверенных карточек документов в месяц с заданной структурой данных.",
    href: "/experience/database-flow",
    coverImage: "/assets/shalya-database.webp",
  },
];

const coverColors = [
  "#17263a",
  "#5b1822",
  "#283c32",
  "#6a4326",
  "#192e30",
  "#171717",
  "#2c3850",
  "#4c2b3f",
  "#31453b",
  "#6a2228",
];

function createLabelTexture(item: ShelfItem, index: number, targetAspect?: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = targetAspect
    ? Math.min(1280, Math.round(canvas.width / targetAspect))
    : 1024;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const centerX = canvas.width / 2;
  const scaleX = canvas.width / 384;
  const scaleY = canvas.height / 1024;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(224, 190, 119, .92)";
  context.lineWidth = 5 * scaleX;
  context.strokeRect(30 * scaleX, 30 * scaleY, canvas.width - 60 * scaleX, canvas.height - 60 * scaleY);
  context.strokeRect(48 * scaleX, 48 * scaleY, canvas.width - 96 * scaleX, canvas.height - 96 * scaleY);
  context.fillStyle = "#e1bd75";
  context.textAlign = "center";
  context.font = `600 ${28 * scaleX}px Georgia`;
  context.fillText(item.kind.toUpperCase(), centerX, 105 * scaleY);
  context.font = `${44 * scaleX}px Georgia`;
  context.fillText(String(index + 1).padStart(2, "0"), centerX, 176 * scaleY);

  context.beginPath();
  context.moveTo(112 * scaleX, 220 * scaleY);
  context.lineTo(272 * scaleX, 220 * scaleY);
  context.stroke();

  context.fillStyle = "#f0d59a";
  // The title runs along the volume on a separate decal. The leather can bend,
  // while the letters retain their natural width.
  context.save();
  context.translate(centerX, canvas.height * 0.49);
  context.rotate(-Math.PI / 2);
  context.font = `600 ${78 * scaleX}px Georgia`;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillText(item.spine.toUpperCase(), 0, 0, canvas.height * 0.43);
  context.restore();

  context.strokeStyle = "rgba(224, 190, 119, .8)";
  context.lineWidth = 4 * scaleX;
  context.beginPath();
  context.arc(centerX, 760 * scaleY, 62 * scaleX, 0, Math.PI * 2);
  context.moveTo(centerX - 42 * scaleX, 760 * scaleY);
  context.lineTo(centerX + 42 * scaleX, 760 * scaleY);
  context.moveTo(centerX, 760 * scaleY - 42 * scaleX);
  context.lineTo(centerX, 760 * scaleY + 42 * scaleX);
  context.stroke();

  context.fillStyle = "#e1bd75";
  context.font = `${30 * scaleX}px Georgia`;
  context.fillText(item.year ?? "АРХИВУМ", centerX, 910 * scaleY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function drawWrappedTitle(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((value, lineIndex) => {
    context.fillText(value, centerX, startY + lineIndex * 46);
  });
}

function createProjectCoverTexture(item: ShelfItem, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 896;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const drawBase = () => {
    context.fillStyle = "#172a43";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#c7a66a";
    context.lineWidth = 5;
    context.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    context.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);
    context.fillStyle = "#d5b77e";
    context.textAlign = "center";
    context.font = "600 22px Georgia";
    context.fillText("АРХИВУМ · ВЫПОЛНЕННЫЙ ПРОЕКТ", canvas.width / 2, 96);
    context.font = "600 21px Arial";
    context.fillText(String(index + 1).padStart(2, "0"), canvas.width / 2, 132);
    context.font = "54px Georgia";
    drawWrappedTitle(context, item.spine.toUpperCase(), canvas.width / 2, 696, 540);
    context.font = "28px Georgia";
    context.fillText(item.year ?? "ВЫПОЛНЕННЫЙ ПРОЕКТ", canvas.width / 2, 824);
    context.beginPath();
    context.moveTo(160, 850);
    context.lineTo(480, 850);
    context.stroke();
  };

  drawBase();
  const image = new Image();
  image.onload = () => {
    const frame = { x: 56, y: 158, width: 528, height: 440 };
    const scale = Math.max(frame.width / image.width, frame.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.save();
    context.beginPath();
    context.rect(frame.x, frame.y, frame.width, frame.height);
    context.clip();
    context.drawImage(
      image,
      frame.x + (frame.width - width) / 2,
      frame.y + (frame.height - height) / 2,
      width,
      height,
    );
    const wash = context.createLinearGradient(0, frame.y, 0, frame.y + frame.height);
    wash.addColorStop(0, "rgba(16, 29, 49, .04)");
    wash.addColorStop(1, "rgba(16, 29, 49, .34)");
    context.fillStyle = wash;
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
    context.restore();
    context.strokeStyle = "#d5b77e";
    context.lineWidth = 5;
    context.strokeRect(frame.x, frame.y, frame.width, frame.height);
    texture.needsUpdate = true;
  };
  image.src = item.coverImage;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function ArchiveShelf() {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const inspectRef = useRef(false);
  const [active, setActive] = useState(0);
  const [inspect, setInspect] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const selectedItem = shelfItems[active];

  const compactMarkers = useMemo(
    () => shelfItems.map((item, index) => ({ label: `${item.kind} ${index + 1}: ${item.title}`, index })),
    [],
  );

  function select(index: number) {
    const next = (index + shelfItems.length) % shelfItems.length;
    activeRef.current = next;
    setActive(next);
  }

  function toggleInspect(next?: boolean) {
    const value = next ?? !inspectRef.current;
    inspectRef.current = value;
    setInspect(value);
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      });
    } catch {
      window.setTimeout(() => setWebglFailed(true), 0);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = window.innerWidth > 760;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "Интерактивная трёхмерная архивная полка");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e9e0d1");
    scene.fog = new THREE.Fog("#e9e0d1", 12, 23);

    const camera = new THREE.PerspectiveCamera(32, mount.clientWidth / mount.clientHeight, 0.1, 60);
    camera.position.set(0, 0.25, 10);

    const ambient = new THREE.HemisphereLight("#fff8e8", "#493522", 2.6);
    scene.add(ambient);
    const key = new THREE.DirectionalLight("#ffe8bd", 4.2);
    key.position.set(-4, 7, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#b9cee5", 1.1);
    rim.position.set(6, 2, -3);
    scene.add(rim);

    const shelfWorld = new THREE.Group();
    scene.add(shelfWorld);

    const bookGroups: THREE.Group[] = [];
    const positions: number[] = [];
    const baseY: number[] = [];
    const textures: THREE.Texture[] = [];
    const textureLoader = new THREE.TextureLoader();
    const loadMaterialTexture = (
      path: string,
      colorTexture = false,
      repeat: [number, number] = [1, 1],
    ) => {
      const texture = textureLoader.load(sitePath(path));
      if (colorTexture) texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(...repeat);
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      textures.push(texture);
      return texture;
    };

    const woodColor = loadMaterialTexture(
      "/assets/textures/wood050-color.webp",
      true,
      [2.15, 1],
    );
    const woodNormal = loadMaterialTexture(
      "/assets/textures/wood050-normal.webp",
      false,
      [2.15, 1],
    );
    const woodRoughness = loadMaterialTexture(
      "/assets/textures/wood050-roughness.webp",
      false,
      [2.15, 1],
    );
    const wood = new THREE.MeshStandardMaterial({
      color: "#c3aaa0",
      map: woodColor,
      normalMap: woodNormal,
      normalScale: new THREE.Vector2(0.18, 0.18),
      roughnessMap: woodRoughness,
      roughness: 0.86,
      metalness: 0.02,
    });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(16, 0.28, 2.35), wood);
    shelf.position.set(0, -2.02, -0.05);
    shelf.receiveShadow = true;
    scene.add(shelf);
    const shelfEdge = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.2, 0.16),
      new THREE.MeshStandardMaterial({
        color: "#9f7f73",
        map: woodColor,
        normalMap: woodNormal,
        roughnessMap: woodRoughness,
        roughness: 0.82,
      }),
    );
    shelfEdge.position.set(0, -1.91, 1.1);
    scene.add(shelfEdge);
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(16, 4.8, 0.18),
      new THREE.MeshStandardMaterial({
        color: "#d1bbb2",
        map: woodColor,
        normalMap: woodNormal,
        normalScale: new THREE.Vector2(0.12, 0.12),
        roughnessMap: woodRoughness,
        roughness: 0.9,
        metalness: 0,
      }),
    );
    back.position.set(0, 0.18, -1.15);
    back.receiveShadow = true;
    scene.add(back);

    const inspectionBackdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 18),
      new THREE.MeshStandardMaterial({
        color: "#eee8db",
        roughness: 1,
        metalness: 0,
      }),
    );
    inspectionBackdrop.position.set(0, 4.5, -3.2);
    inspectionBackdrop.receiveShadow = true;
    inspectionBackdrop.visible = false;
    scene.add(inspectionBackdrop);

    const inspectionFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 12),
      new THREE.MeshStandardMaterial({
        color: "#e7dfd0",
        roughness: 0.94,
        metalness: 0,
      }),
    );
    inspectionFloor.rotation.x = -Math.PI / 2;
    inspectionFloor.position.set(0, -2.72, 0.25);
    inspectionFloor.receiveShadow = true;
    inspectionFloor.visible = false;
    scene.add(inspectionFloor);

    const leatherColor = loadMaterialTexture(
      "/assets/textures/leather033c-neutral.webp",
      true,
      [1.35, 4.2],
    );
    const leatherNormal = loadMaterialTexture(
      "/assets/textures/leather033c-normal.webp",
      false,
      [1.35, 4.2],
    );
    const leatherRoughness = loadMaterialTexture(
      "/assets/textures/leather033c-roughness.webp",
      false,
      [1.35, 4.2],
    );
    const leatherDisplacement = loadMaterialTexture(
      "/assets/textures/leather033c-displacement.webp",
      false,
      [1.35, 4.2],
    );
    const paperColor = loadMaterialTexture(
      "/assets/textures/bark012-color.webp",
      true,
      [1.45, 4.1],
    );
    const paperNormal = loadMaterialTexture(
      "/assets/textures/bark012-normal.webp",
      false,
      [1.45, 4.1],
    );
    const paperRoughness = loadMaterialTexture(
      "/assets/textures/bark012-roughness.webp",
      false,
      [1.45, 4.1],
    );
    const paperDisplacement = loadMaterialTexture(
      "/assets/textures/bark012-displacement.webp",
      false,
      [1.45, 4.1],
    );
    let cursorX = 0;

    shelfItems.forEach((item, index) => {
      const width = 0.5 + (index % 4) * 0.065;
      const height = 2.65 + ((index * 7) % 6) * 0.14;
      const depth = height * (640 / 896);
      const coverThickness = 0.082;
      const visibleGap = 0.065;
      cursorX += width / 2;
      positions.push(cursorX);
      const group = new THREE.Group();
      group.position.set(cursorX, -1.84 + height / 2, 0);
      group.rotation.z = index % 7 === 5 ? -0.025 : index % 8 === 3 ? 0.018 : 0;
      group.userData.index = index;

      const labelWidth = width * 0.74;
      const labelHeight = height * 0.82;
      const labelTexture = createLabelTexture(
        item,
        index,
        labelWidth / labelHeight,
      );
      const coverTexture = createProjectCoverTexture(item, index);
      if (labelTexture) textures.push(labelTexture);
      if (coverTexture) textures.push(coverTexture);

      const cloth = new THREE.MeshStandardMaterial({
        color: coverColors[index % coverColors.length],
        map: leatherColor,
        normalMap: leatherNormal,
        normalScale: new THREE.Vector2(0.48, 0.48),
        bumpMap: leatherDisplacement,
        bumpScale: 0.016,
        roughnessMap: leatherRoughness,
        roughness: 0.86,
        metalness: 0.02,
        transparent: false,
        opacity: 1,
        depthWrite: true,
        side: THREE.FrontSide,
      });
      const pages = new THREE.MeshStandardMaterial({
        color: "#eee4d1",
        map: paperColor,
        normalMap: paperNormal,
        normalScale: new THREE.Vector2(0.24, 0.24),
        bumpMap: paperDisplacement,
        bumpScale: 0.012,
        roughnessMap: paperRoughness,
        roughness: 1,
      });
      const pageEdge = new THREE.MeshStandardMaterial({
        color: "#f1e8d8",
        map: paperColor,
        normalMap: paperNormal,
        normalScale: new THREE.Vector2(0.2, 0.28),
        bumpMap: paperDisplacement,
        bumpScale: 0.01,
        roughnessMap: paperRoughness,
        roughness: 1,
      });

      const pageBlock = new THREE.Mesh(
        new THREE.BoxGeometry(
          width * 0.82,
          height * 0.885,
          depth * 0.84,
          1,
          20,
          1,
        ),
        // BoxGeometry material order: right, left, top, bottom, front, back.
        // The outer page edge is on the two Z faces; it needs horizontal leaf
        // strata, while the hidden faces retain the natural paper surface.
        [pages, pages, pages, pages, pageEdge, pageEdge],
      );
      pageBlock.position.z = -0.045;
      pageBlock.castShadow = true;
      group.add(pageBlock);

      // Real case-bound covers stop at the hinge instead of running over the
      // rounded spine. Shortening and shifting the boards exposes the leather
      // shoulder; otherwise the two covers read as black rails in front of it.
      const coverDepth = depth * 0.89;
      const coverShiftZ = -depth * 0.055;
      const leftCover = new THREE.Mesh(
        new THREE.BoxGeometry(coverThickness, height, coverDepth, 2, 10, 4),
        cloth,
      );
      leftCover.position.set(-width / 2, 0, coverShiftZ);
      leftCover.castShadow = true;
      group.add(leftCover);
      const rightCover = leftCover.clone();
      rightCover.position.x = width / 2;
      group.add(rightCover);

      // Closed D-shaped spine: curved outside, sealed against the page block.
      const spineWidth = width + coverThickness;
      const spineBack = coverShiftZ + coverDepth / 2 + 0.008;
      const spineFront = depth / 2 + width * 0.2;
      const spineShape = new THREE.Shape();
      spineShape.moveTo(-spineWidth / 2, spineBack);
      spineShape.quadraticCurveTo(0, spineFront, spineWidth / 2, spineBack);
      spineShape.lineTo(-spineWidth / 2, spineBack);
      spineShape.closePath();
      const spineGeometry = new THREE.ExtrudeGeometry(spineShape, {
        depth: height,
        bevelEnabled: false,
        curveSegments: 48,
        steps: 1,
      });
      spineGeometry.rotateX(Math.PI / 2);
      spineGeometry.translate(0, height / 2, 0);
      const spine = new THREE.Mesh(spineGeometry, cloth);
      spine.castShadow = true;
      spine.receiveShadow = true;
      group.add(spine);

      if (labelTexture) {
        const segments = 36;
        const labelPositions: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        for (let row = 0; row <= 1; row += 1) {
          const y = (row - 0.5) * labelHeight;
          for (let column = 0; column <= segments; column += 1) {
            const u = column / segments;
            const x = (u - 0.5) * labelWidth;
            const spineU = x / spineWidth + 0.5;
            const z =
              (1 - spineU) * (1 - spineU) * spineBack +
              2 * (1 - spineU) * spineU * spineFront +
              spineU * spineU * spineBack +
              0.006;
            labelPositions.push(x, y, z);
            uvs.push(u, row);
          }
        }
        for (let column = 0; column < segments; column += 1) {
          const a = column;
          const b = column + 1;
          const c = segments + 1 + column;
          const d = c + 1;
          indices.push(a, b, c, b, d, c);
        }
        const labelGeometry = new THREE.BufferGeometry();
        labelGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(labelPositions, 3),
        );
        labelGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
        labelGeometry.setIndex(indices);
        labelGeometry.computeVertexNormals();
        const label = new THREE.Mesh(
          labelGeometry,
          new THREE.MeshStandardMaterial({
            map: labelTexture,
            transparent: true,
            alphaTest: 0.03,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            roughness: 0.48,
            metalness: 0.18,
          }),
        );
        group.add(label);
      }

      if (coverTexture) {
        const frontCover = new THREE.Mesh(
          new THREE.PlaneGeometry(coverDepth * 0.94, height * 0.94, 6, 10),
          new THREE.MeshStandardMaterial({
            map: coverTexture,
            roughness: 0.7,
            metalness: 0.03,
          }),
        );
        frontCover.rotation.y = Math.PI / 2;
        frontCover.position.set(
          width / 2 + coverThickness / 2 + 0.004,
          0,
          coverShiftZ,
        );
        group.add(frontCover);

        const headbandMaterial = new THREE.MeshStandardMaterial({
          color: "#b28b4d",
          roughness: 0.62,
        });
        [-1, 1].forEach((side) => {
          const headband = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, width * 0.78, 12),
            headbandMaterial,
          );
          headband.rotation.z = Math.PI / 2;
          headband.position.set(0, side * height * 0.455, depth * 0.405);
          group.add(headband);
        });

        const hingeMaterial = new THREE.MeshStandardMaterial({
          color: "#102138",
          roughness: 0.86,
        });
        [-1, 1].forEach((side) => {
          const hinge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.018, height * 0.91, 10),
            hingeMaterial,
          );
          hinge.position.set(side * width * 0.47, 0, depth * 0.455);
          hinge.position.z = coverShiftZ + coverDepth / 2 + 0.012;
          group.add(hinge);
        });
      }

      group.traverse((child) => {
        child.userData.bookIndex = index;
      });
      baseY.push(group.position.y);
      bookGroups.push(group);
      shelfWorld.add(group);
      // Each board protrudes half of coverThickness beyond the nominal book
      // width. Account for both neighboring boards so the visible air gap does
      // not disappear even though the page blocks themselves are separated.
      cursorX += width / 2 + coverThickness + visibleGap;
    });

    const totalWidth = cursorX;
    const centerOffset = totalWidth / 2;
    positions.forEach((_, index) => {
      positions[index] -= centerOffset;
      bookGroups[index].position.x = positions[index];
    });

    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 7),
      new THREE.ShadowMaterial({ color: "#24170f", opacity: 0.22 }),
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -2.17;
    floorShadow.receiveShadow = true;
    scene.add(floorShadow);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragStart = { x: 0, y: 0 };
    const rotation = { x: -0.08, y: -0.55 };
    const pan = { x: 0, y: 0 };
    let dragging = false;
    let moved = false;
    let zoom = 1.45;
    let wheelLocked = false;
    let animationFrame = 0;

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = false;
      dragStart.x = event.clientX;
      dragStart.y = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      if (inspectRef.current) {
        if (event.shiftKey || event.buttons === 2) {
          pan.x = THREE.MathUtils.clamp(pan.x + dx * 0.0025, -0.7, 0.7);
          pan.y = THREE.MathUtils.clamp(pan.y - dy * 0.0025, -0.45, 0.45);
        } else {
          rotation.y += dx * 0.008;
          rotation.x = THREE.MathUtils.clamp(rotation.x + dy * 0.006, -0.75, 0.75);
        }
      } else if (Math.abs(dx) > 38) {
        select(activeRef.current + (dx < 0 ? 1 : -1));
        dragStart.x = event.clientX;
        dragStart.y = event.clientY;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (!moved && !inspectRef.current) {
        updatePointer(event);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(bookGroups, true)[0];
        const index = hit?.object.userData.bookIndex;
        if (typeof index === "number") {
          if (index === activeRef.current) toggleInspect(true);
          else select(index);
        }
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (inspectRef.current) {
        zoom = THREE.MathUtils.clamp(zoom - event.deltaY * 0.0013, 1.05, 2.15);
        return;
      }
      if (wheelLocked || Math.abs(event.deltaY) < 4) return;
      wheelLocked = true;
      select(activeRef.current + (event.deltaY > 0 ? 1 : -1));
      window.setTimeout(() => {
        wheelLocked = false;
      }, 150);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && inspectRef.current) toggleInspect(false);
      if (!inspectRef.current && event.key === "ArrowRight") select(activeRef.current + 1);
      if (!inspectRef.current && event.key === "ArrowLeft") select(activeRef.current - 1);
      if (event.key === "Enter" && document.activeElement === renderer.domElement) {
        toggleInspect(true);
      }
    };

    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    const onResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    renderer.domElement.tabIndex = 0;
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const selected = activeRef.current;
      const inspecting = inspectRef.current;
      const targetWorldX = -positions[selected];
      shelfWorld.position.x = THREE.MathUtils.damp(shelfWorld.position.x, targetWorldX, 7.5, delta);

      bookGroups.forEach((book, index) => {
        const isSelected = index === selected;
        const targetZ = isSelected ? (inspecting ? 2.15 : 0.34) : 0;
        const targetScale = isSelected ? (inspecting ? zoom : 1.035) : 1;
        book.position.z = THREE.MathUtils.damp(book.position.z, targetZ, 8, delta);
        book.scale.setScalar(THREE.MathUtils.damp(book.scale.x, targetScale, 8, delta));
        book.position.y = THREE.MathUtils.damp(
          book.position.y,
          baseY[index] +
            (isSelected ? (inspecting ? 0.58 + pan.y : 0.04) : 0),
          8,
          delta,
        );
        book.position.x = THREE.MathUtils.damp(
          book.position.x,
          positions[index] + (isSelected && inspecting ? pan.x : 0),
          8,
          delta,
        );
        if (isSelected && inspecting) {
          book.rotation.x = THREE.MathUtils.damp(book.rotation.x, rotation.x, 9, delta);
          book.rotation.y = THREE.MathUtils.damp(book.rotation.y, rotation.y, 9, delta);
          book.visible = true;
        } else {
          book.rotation.x = THREE.MathUtils.damp(book.rotation.x, 0, 9, delta);
          book.rotation.y = THREE.MathUtils.damp(book.rotation.y, 0, 9, delta);
          book.visible = !inspecting;
        }
      });

      shelf.visible = !inspecting;
      shelfEdge.visible = !inspecting;
      back.visible = !inspecting;
      floorShadow.visible = !inspecting;
      inspectionBackdrop.visible = inspecting;
      inspectionFloor.visible = inspecting;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className="archive-shelf-section" aria-labelledby="archive-shelf-title">
      <div className="shell archive-shelf-heading">
        <div>
          <p className="eyebrow eyebrow-light">Выполненные проекты</p>
          <h2 id="archive-shelf-title">Архивная полка</h2>
        </div>
        <p>
          Десять выполненных проектов — от редких изданий и газет до больших
          архивных массивов и цифровых систем. Выберите корешок и откройте работу.
        </p>
      </div>

      <div className={`archive-shelf-experience${inspect ? " is-inspecting" : ""}`}>
        <div className="archive-shelf-canvas" ref={mountRef}>
          {webglFailed ? (
            <div className="archive-shelf-fallback">
              <p>Трёхмерный режим недоступен на этом устройстве.</p>
              <Link href={selectedItem.href}>Открыть выбранный раздел →</Link>
            </div>
          ) : null}
        </div>

        <div className="archive-shelf-index">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <i />
          <span>{String(shelfItems.length).padStart(2, "0")}</span>
        </div>

        <article className="archive-shelf-card" aria-live="polite">
          <p className="eyebrow eyebrow-light">{selectedItem.kind}</p>
          <h3>{selectedItem.title}</h3>
          <p>{selectedItem.detail}</p>
          <div className="archive-shelf-actions">
            <button type="button" onClick={() => toggleInspect(!inspect)}>
              {inspect ? "Вернуть на полку" : "Осмотреть том"}
            </button>
            <Link href={selectedItem.href}>Открыть проект →</Link>
          </div>
        </article>

        <div className="archive-shelf-controls" aria-label="Управление архивной полкой">
          <button type="button" onClick={() => select(active - 1)} aria-label="Предыдущий том">
            ←
          </button>
          <span>
            {inspect ? "Тяните — вращение · Shift + тянуть — сдвиг · колесо — масштаб" : "Тяните полку или используйте колесо"}
          </span>
          <button type="button" onClick={() => select(active + 1)} aria-label="Следующий том">
            →
          </button>
        </div>

        <div className="archive-shelf-markers" aria-label="Выбрать том">
          {compactMarkers.map((marker) => (
            <button
              type="button"
              key={marker.index}
              className={marker.index === active ? "is-active" : ""}
              aria-label={marker.label}
              aria-current={marker.index === active ? "true" : undefined}
              onClick={() => select(marker.index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
