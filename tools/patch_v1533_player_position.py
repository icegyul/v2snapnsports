from pathlib import Path

BASE = Path('apps/web/src/three/stadiumWebglV14.ts')
WRAPPER = Path('apps/web/src/three/stadiumWebglV151.ts')
PAGES = Path('apps/web/src/features/stadium/PlayerStadiumPages.tsx')

base = BASE.read_text()

old_interface = '''  renderApproach?(progress: number): void;\n  renderPitchEntry?(progress: number): void;\n  destroy(): void;'''
new_interface = '''  renderApproach?(progress: number): void;\n  renderPitchEntry?(progress: number): void;\n  renderPlayerPosition?(progress: number, x: number, z: number): void;\n  destroy(): void;'''
if base.count(old_interface) != 1:
    raise SystemExit(f'V15.33 interface anchor mismatch: {base.count(old_interface)}')
base = base.replace(old_interface, new_interface, 1)

stadium_anchor = '''  const stadium = buildStadium(scene, renderer, mode, recipe, geometries, materials, textures);\n\n  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, 380);'''
marker_block = '''  const stadium = buildStadium(scene, renderer, mode, recipe, geometries, materials, textures);\n\n  const positionMarker = new THREE.Group();\n  positionMarker.visible = false;\n  stadium.add(positionMarker);\n\n  const markerRingMaterial = addDisposable(\n    materials,\n    new THREE.MeshStandardMaterial({\n      color: recipe.accentColor,\n      emissive: recipe.accentColor,\n      emissiveIntensity: 3.2,\n      roughness: 0.25,\n      metalness: 0.18,\n      transparent: true,\n      opacity: 0.92,\n    }),\n  );\n  const markerBeaconMaterial = addDisposable(\n    materials,\n    new THREE.MeshBasicMaterial({\n      color: 0x8cddff,\n      transparent: true,\n      opacity: 0.22,\n      depthWrite: false,\n      side: THREE.DoubleSide,\n    }),\n  );\n  const markerBodyMaterial = addDisposable(\n    materials,\n    new THREE.MeshStandardMaterial({\n      color: 0xdcebf1,\n      emissive: recipe.accentColor,\n      emissiveIntensity: 0.52,\n      roughness: 0.58,\n      metalness: 0.08,\n    }),\n  );\n  const markerRingGeometry = addDisposable(geometries, new THREE.TorusGeometry(1.7, 0.085, 8, 48));\n  const markerRingOuterGeometry = addDisposable(geometries, new THREE.TorusGeometry(2.35, 0.045, 6, 48));\n  const markerBeaconGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.34, 1.65, 5.4, 24, 1, true));\n  const markerBodyGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.25, 0.20, 1.05, 8));\n  const markerHeadGeometry = addDisposable(geometries, new THREE.SphereGeometry(0.20, 10, 7));\n\n  const markerRing = new THREE.Mesh(markerRingGeometry, markerRingMaterial);\n  markerRing.rotation.x = Math.PI / 2;\n  markerRing.position.y = 0.10;\n  positionMarker.add(markerRing);\n  const markerRingOuter = new THREE.Mesh(markerRingOuterGeometry, markerRingMaterial);\n  markerRingOuter.rotation.x = Math.PI / 2;\n  markerRingOuter.position.y = 0.08;\n  positionMarker.add(markerRingOuter);\n  const markerBeacon = new THREE.Mesh(markerBeaconGeometry, markerBeaconMaterial);\n  markerBeacon.position.y = 2.72;\n  positionMarker.add(markerBeacon);\n  const markerBody = new THREE.Mesh(markerBodyGeometry, markerBodyMaterial);\n  markerBody.position.y = 0.78;\n  positionMarker.add(markerBody);\n  const markerHead = new THREE.Mesh(markerHeadGeometry, markerBodyMaterial);\n  markerHead.position.y = 1.47;\n  positionMarker.add(markerHead);\n\n  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, 380);'''
if base.count(stadium_anchor) != 1:
    raise SystemExit(f'V15.33 marker anchor mismatch: {base.count(stadium_anchor)}')
base = base.replace(stadium_anchor, marker_block, 1)

triangle_anchor = '''  const triangleCount = countTriangles(stadium);'''
position_render = '''  const renderPlayerPosition = (progress0: number, x0: number, z0: number) => {\n    const progress = THREE.MathUtils.clamp(progress0, 0, 1);\n    const eased = progress * progress * (3 - 2 * progress);\n    const portrait = cssWidth / cssHeight < 0.82;\n    const x = THREE.MathUtils.clamp(x0, -47, 47);\n    const z = THREE.MathUtils.clamp(z0, -29, 29);\n    camera.aspect = cssWidth / cssHeight;\n    camera.zoom = 1;\n\n    const start = portrait\n      ? new THREE.Vector3(1.8, 2.45, 30.5)\n      : new THREE.Vector3(5.8, 2.25, 29.5);\n    const end = portrait\n      ? new THREE.Vector3(x + 10.5, 9.2, z + 20.5)\n      : new THREE.Vector3(x + 15.5, 7.4, z + 21.0);\n    const startTarget = new THREE.Vector3(0, 1.1, -16);\n    const endTarget = new THREE.Vector3(x, 1.1, z);\n    const local = eased * eased * (3 - 2 * eased);\n\n    camera.position.lerpVectors(start, end, local);\n    const lookTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, local);\n    camera.lookAt(lookTarget);\n    camera.fov = portrait\n      ? THREE.MathUtils.lerp(69, 62, local)\n      : THREE.MathUtils.lerp(66, 58, local);\n    camera.updateProjectionMatrix();\n\n    positionMarker.position.set(x, 0.03, z);\n    positionMarker.visible = progress > 0.22;\n    const reveal = THREE.MathUtils.smoothstep(progress, 0.22, 0.72);\n    const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.035 * reveal;\n    positionMarker.scale.setScalar(Math.max(0.001, reveal * pulse));\n    markerRing.rotation.z = progress * 1.2;\n    markerRingOuter.rotation.z = -progress * 0.75;\n    stadium.rotation.y = -0.015;\n    renderer.render(scene, camera);\n  };\n\n'''
if base.count(triangle_anchor) != 1:
    raise SystemExit(f'V15.33 render insertion anchor mismatch: {base.count(triangle_anchor)}')
base = base.replace(triangle_anchor, position_render + triangle_anchor, 1)

old_return = '''  return { triangleCount, resize, render, renderApproach, renderPitchEntry, destroy };'''
new_return = '''  return { triangleCount, resize, render, renderApproach, renderPitchEntry, renderPlayerPosition, destroy };'''
if base.count(old_return) != 1:
    raise SystemExit(f'V15.33 return anchor mismatch: {base.count(old_return)}')
base = base.replace(old_return, new_return, 1)
BASE.write_text(base)

wrapper = WRAPPER.read_text()
old_wrapper = '''    renderPitchEntry(progress: number) {\n      base.renderPitchEntry?.(progress);\n    },\n    destroy() {'''
new_wrapper = '''    renderPitchEntry(progress: number) {\n      base.renderPitchEntry?.(progress);\n    },\n    renderPlayerPosition(progress: number, x: number, z: number) {\n      base.renderPlayerPosition?.(progress, x, z);\n    },\n    destroy() {'''
if wrapper.count(old_wrapper) != 1:
    raise SystemExit(f'V15.33 wrapper anchor mismatch: {wrapper.count(old_wrapper)}')
wrapper = wrapper.replace(old_wrapper, new_wrapper, 1)
WRAPPER.write_text(wrapper)

pages = PAGES.read_text()
old_import = '''import { PitchEntryScene } from "./PitchEntryScene";\nimport "./stadium.css";\nimport "./stadiumApproach.css";\nimport "./pitchEntry.css";'''
new_import = '''import { PitchEntryScene } from "./PitchEntryScene";\nimport { PlayerPosition3DScene } from "./PlayerPosition3DScene";\nimport "./stadium.css";\nimport "./stadiumApproach.css";\nimport "./pitchEntry.css";\nimport "./playerPosition3D.css";'''
if pages.count(old_import) != 1:
    raise SystemExit(f'V15.33 page import anchor mismatch: {pages.count(old_import)}')
pages = pages.replace(old_import, new_import, 1)

old_page = '''export function MyPositionPage() {\n  const formation = useFixture(loadFormation);\n  return <CoreStateBoundary state={formation ? "READY" : "LOADING"}><main className="shell-main"><p className="eyebrow">MY POSITION</p><h1>나의 포지션</h1>{formation && <FormationBoard formation={formation} />}<p className="meta">본인 marker는 double ring과 라벨로 구분합니다. 동료는 등번호와 포지션만 표시합니다.</p><Link className="surface-link" to="/home/formation">나의 팀 포메이션</Link></main></CoreStateBoundary>;\n}'''
new_page = '''export function MyPositionPage() {\n  const formation = useFixture(loadFormation);\n  const home = useFixture(loadStadiumHome);\n  const [complete, setComplete] = useState(false);\n  const ready = Boolean(formation && home);\n  return <CoreStateBoundary state={ready ? "READY" : "LOADING"}>{formation && home ? <main className="shell-main player-position-page">\n    <header className="player-position-header">\n      <div>\n        <p className="eyebrow">MY POSITION · 3D REVEAL</p>\n        <h1>나의 포지션</h1>\n      </div>\n      <p className="player-position-meta">{home.team.displayName} · 피치 레벨에서 #{formation.player.shirtNumber} {formation.player.primaryPosition}의 실제 공간 위치를 표시합니다.</p>\n    </header>\n    <PlayerPosition3DScene mode={home.visualMode} player={formation.player} onComplete={() => setComplete(true)} />\n    <footer className="player-position-footer">\n      <p>{complete ? `#${formation.player.shirtNumber} ${formation.player.primaryPosition} 위치 확인 완료` : "피치 위에서 나의 위치를 찾는 중입니다."}</p>\n      <Link className="surface-link" to="/home/formation">나의 팀 포메이션</Link>\n    </footer>\n  </main> : null}</CoreStateBoundary>;\n}'''
if pages.count(old_page) != 1:
    raise SystemExit(f'V15.33 MyPositionPage anchor mismatch: {pages.count(old_page)}')
pages = pages.replace(old_page, new_page, 1)
PAGES.write_text(pages)
