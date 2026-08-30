from pathlib import Path

ROOT = Path('.')

# 1) Renderer contract + 3D formation rendering
renderer_path = ROOT / 'apps/web/src/three/stadiumWebglV14.ts'
text = renderer_path.read_text()

old = '''export interface StadiumWebglRenderer {\n  readonly triangleCount: number;\n  resize(width: number, height: number, dpr: number): void;\n  render(orbit: number, zoom: number): void;\n  renderApproach?(progress: number): void;\n  renderPitchEntry?(progress: number): void;\n  renderPlayerPosition?(progress: number, x: number, z: number): void;\n  destroy(): void;\n}\n'''
new = '''export interface StadiumTeamMarker {\n  readonly x: number;\n  readonly z: number;\n  readonly shirtNumber: string;\n  readonly position: string;\n}\n\nexport interface StadiumWebglRenderer {\n  readonly triangleCount: number;\n  resize(width: number, height: number, dpr: number): void;\n  render(orbit: number, zoom: number): void;\n  renderApproach?(progress: number): void;\n  renderPitchEntry?(progress: number): void;\n  renderPlayerPosition?(progress: number, x: number, z: number): void;\n  renderTeamFormation?(progress: number, ownX: number, ownZ: number, teammates: readonly StadiumTeamMarker[]): void;\n  destroy(): void;\n}\n'''
if text.count(old) != 1:
    raise SystemExit(f'V15.34 renderer interface anchor mismatch: {text.count(old)}')
text = text.replace(old, new, 1)

anchor = '''  const markerHead = new THREE.Mesh(markerHeadGeometry, markerBodyMaterial);\n  markerHead.position.y = 1.47;\n  positionMarker.add(markerHead);\n\n  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, 380);\n'''
insert = '''  const markerHead = new THREE.Mesh(markerHeadGeometry, markerBodyMaterial);\n  markerHead.position.y = 1.47;\n  positionMarker.add(markerHead);\n\n  const teamFormationRoot = new THREE.Group();\n  teamFormationRoot.visible = false;\n  stadium.add(teamFormationRoot);\n  const teammateRingMaterial = addDisposable(\n    materials,\n    new THREE.MeshStandardMaterial({\n      color: 0x8ea8b6,\n      emissive: 0x31586d,\n      emissiveIntensity: 1.15,\n      roughness: 0.52,\n      metalness: 0.16,\n      transparent: true,\n      opacity: 0.82,\n    }),\n  );\n  const teammateBodyMaterial = addDisposable(\n    materials,\n    new THREE.MeshStandardMaterial({\n      color: 0xaebbc2,\n      emissive: 0x1a3948,\n      emissiveIntensity: 0.38,\n      roughness: 0.66,\n      metalness: 0.05,\n    }),\n  );\n  const teammateRingGeometry = addDisposable(geometries, new THREE.TorusGeometry(1.08, 0.055, 6, 36));\n  const teammateBodyGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.20, 0.17, 0.88, 7));\n  const teammateHeadGeometry = addDisposable(geometries, new THREE.SphereGeometry(0.16, 8, 6));\n  let teamMarkerSignature = \"\";\n\n  const makeTeamLabelTexture = (shirtNumber: string, position: string): THREE.CanvasTexture => {\n    const labelCanvas = document.createElement(\"canvas\");\n    labelCanvas.width = 256;\n    labelCanvas.height = 96;\n    const ctx = labelCanvas.getContext(\"2d\");\n    if (!ctx) throw new Error(\"stadium team marker canvas unavailable\");\n    ctx.clearRect(0, 0, 256, 96);\n    ctx.fillStyle = \"rgba(4,12,16,.78)\";\n    ctx.beginPath();\n    ctx.roundRect(14, 13, 228, 70, 20);\n    ctx.fill();\n    ctx.strokeStyle = \"rgba(185,226,244,.35)\";\n    ctx.lineWidth = 2;\n    ctx.stroke();\n    ctx.fillStyle = \"#e9f7fc\";\n    ctx.font = \"700 30px Arial, sans-serif\";\n    ctx.textAlign = \"center\";\n    ctx.fillText(`#${shirtNumber} · ${position}`, 128, 57);\n    const texture = addDisposable(textures, new THREE.CanvasTexture(labelCanvas));\n    texture.colorSpace = THREE.SRGBColorSpace;\n    return texture;\n  };\n\n  const rebuildTeamMarkers = (markers: readonly StadiumTeamMarker[]) => {\n    while (teamFormationRoot.children.length > 0) teamFormationRoot.remove(teamFormationRoot.children[0]);\n    markers.forEach((marker, index) => {\n      const root = new THREE.Group();\n      root.position.set(marker.x, 0.03, marker.z);\n      root.userData.revealIndex = index;\n\n      const ring = new THREE.Mesh(teammateRingGeometry, teammateRingMaterial);\n      ring.rotation.x = Math.PI / 2;\n      ring.position.y = 0.075;\n      root.add(ring);\n\n      const body = new THREE.Mesh(teammateBodyGeometry, teammateBodyMaterial);\n      body.position.y = 0.68;\n      root.add(body);\n      const head = new THREE.Mesh(teammateHeadGeometry, teammateBodyMaterial);\n      head.position.y = 1.25;\n      root.add(head);\n\n      const labelTexture = makeTeamLabelTexture(marker.shirtNumber, marker.position);\n      const labelMaterial = addDisposable(\n        materials,\n        new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthWrite: false }),\n      );\n      const label = new THREE.Sprite(labelMaterial as THREE.SpriteMaterial);\n      label.position.y = 2.25;\n      label.scale.set(4.8, 1.8, 1);\n      root.add(label);\n      root.scale.setScalar(0.001);\n      teamFormationRoot.add(root);\n    });\n  };\n\n  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, 380);\n'''
if text.count(anchor) != 1:
    raise SystemExit(f'V15.34 renderer marker anchor mismatch: {text.count(anchor)}')
text = text.replace(anchor, insert, 1)

anchor = '''  const triangleCount = countTriangles(stadium);\n\n  const destroy = () => {\n'''
formation_fn = '''  const renderTeamFormation = (progress0: number, ownX0: number, ownZ0: number, teammates: readonly StadiumTeamMarker[]) => {\n    const progress = THREE.MathUtils.clamp(progress0, 0, 1);\n    const eased = progress * progress * (3 - 2 * progress);\n    const portrait = cssWidth / cssHeight < 0.82;\n    const ownX = THREE.MathUtils.clamp(ownX0, -47, 47);\n    const ownZ = THREE.MathUtils.clamp(ownZ0, -29, 29);\n    const safeMarkers = teammates.map((marker) => ({\n      ...marker,\n      x: THREE.MathUtils.clamp(marker.x, -47, 47),\n      z: THREE.MathUtils.clamp(marker.z, -29, 29),\n    }));\n    const signature = safeMarkers.map((marker) => `${marker.shirtNumber}:${marker.position}:${marker.x.toFixed(2)}:${marker.z.toFixed(2)}`).join(\"|\");\n    if (signature !== teamMarkerSignature) {\n      teamMarkerSignature = signature;\n      rebuildTeamMarkers(safeMarkers);\n    }\n\n    let centerX = ownX;\n    let centerZ = ownZ;\n    if (safeMarkers.length > 0) {\n      centerX = (ownX + safeMarkers.reduce((sum, marker) => sum + marker.x, 0)) / (safeMarkers.length + 1);\n      centerZ = (ownZ + safeMarkers.reduce((sum, marker) => sum + marker.z, 0)) / (safeMarkers.length + 1);\n    }\n\n    camera.aspect = cssWidth / cssHeight;\n    camera.zoom = 1;\n    const start = portrait\n      ? new THREE.Vector3(ownX + 10.5, 9.2, ownZ + 20.5)\n      : new THREE.Vector3(ownX + 15.5, 7.4, ownZ + 21.0);\n    const overview = portrait\n      ? new THREE.Vector3(centerX + 37, 45, centerZ + 63)\n      : new THREE.Vector3(centerX + 52, 39, centerZ + 54);\n    const startTarget = new THREE.Vector3(ownX, 1.1, ownZ);\n    const overviewTarget = new THREE.Vector3(centerX, 0.8, centerZ);\n    camera.position.lerpVectors(start, overview, eased);\n    const lookTarget = new THREE.Vector3().lerpVectors(startTarget, overviewTarget, eased);\n    camera.lookAt(lookTarget);\n    camera.fov = portrait\n      ? THREE.MathUtils.lerp(62, 57, eased)\n      : THREE.MathUtils.lerp(58, 52, eased);\n    camera.updateProjectionMatrix();\n\n    positionMarker.position.set(ownX, 0.03, ownZ);\n    positionMarker.visible = true;\n    const ownReveal = THREE.MathUtils.smoothstep(progress, 0.02, 0.26);\n    positionMarker.scale.setScalar(Math.max(0.001, ownReveal));\n    markerRing.rotation.z = progress * 1.0;\n    markerRingOuter.rotation.z = -progress * 0.65;\n\n    teamFormationRoot.visible = progress > 0.20 && safeMarkers.length > 0;\n    const revealWindow = 0.60;\n    const revealStart = 0.24;\n    const perMarker = safeMarkers.length > 0 ? revealWindow / safeMarkers.length : revealWindow;\n    teamFormationRoot.children.forEach((child, index) => {\n      const startAt = revealStart + index * perMarker;\n      const endAt = Math.min(0.96, startAt + Math.max(0.12, perMarker * 1.4));\n      const reveal = THREE.MathUtils.smoothstep(progress, startAt, endAt);\n      child.scale.setScalar(Math.max(0.001, reveal));\n      child.rotation.y = (1 - reveal) * 0.18;\n    });\n\n    stadium.rotation.y = -0.015;\n    renderer.render(scene, camera);\n  };\n\n  const triangleCount = countTriangles(stadium);\n\n  const destroy = () => {\n'''
if text.count(anchor) != 1:
    raise SystemExit(f'V15.34 render insertion anchor mismatch: {text.count(anchor)}')
text = text.replace(anchor, formation_fn, 1)

old_return = '''  return { triangleCount, resize, render, renderApproach, renderPitchEntry, renderPlayerPosition, destroy };\n}'''
new_return = '''  return { triangleCount, resize, render, renderApproach, renderPitchEntry, renderPlayerPosition, renderTeamFormation, destroy };\n}'''
if text.count(old_return) != 1:
    raise SystemExit(f'V15.34 renderer return anchor mismatch: {text.count(old_return)}')
text = text.replace(old_return, new_return, 1)
renderer_path.write_text(text)

# 2) Active wrapper capability passthrough
wrapper_path = ROOT / 'apps/web/src/three/stadiumWebglV151.ts'
text = wrapper_path.read_text()
old = '''    renderPlayerPosition(progress: number, x: number, z: number) {\n      base.renderPlayerPosition?.(progress, x, z);\n    },\n    destroy() {\n'''
new = '''    renderPlayerPosition(progress: number, x: number, z: number) {\n      base.renderPlayerPosition?.(progress, x, z);\n    },\n    renderTeamFormation(progress: number, ownX: number, ownZ: number, teammates) {\n      base.renderTeamFormation?.(progress, ownX, ownZ, teammates);\n    },\n    destroy() {\n'''
if text.count(old) != 1:
    raise SystemExit(f'V15.34 wrapper anchor mismatch: {text.count(old)}')
wrapper_path.write_text(text.replace(old, new, 1))

# 3) Page route: replace 2D formation with 3D scene, keep privacy semantics
pages_path = ROOT / 'apps/web/src/features/stadium/PlayerStadiumPages.tsx'
text = pages_path.read_text()
import_anchor = '''import { PlayerPosition3DScene } from \"./PlayerPosition3DScene\";\n'''
if text.count(import_anchor) != 1:
    raise SystemExit(f'V15.34 page import anchor mismatch: {text.count(import_anchor)}')
text = text.replace(import_anchor, import_anchor + 'import { TeamFormation3DScene } from "./TeamFormation3DScene";\n', 1)
css_anchor = '''import \"./playerPosition3D.css\";\n'''
if text.count(css_anchor) != 1:
    raise SystemExit(f'V15.34 page css anchor mismatch: {text.count(css_anchor)}')
text = text.replace(css_anchor, css_anchor + 'import "./teamFormation3D.css";\n', 1)

board_start = text.find('function FormationBoard(')
board_end = text.find('\nfunction PositionAccessibilityContract', board_start)
if board_start == -1 or board_end == -1:
    raise SystemExit('V15.34 FormationBoard block not found')
text = text[:board_start] + text[board_end + 1:]

old_page = '''export function MyTeamFormationPage() {\n  const formation = useFixture(loadFormation);\n  return <CoreStateBoundary state={formation ? \"READY\" : \"LOADING\"}><main className=\"shell-main\"><p className=\"eyebrow\">TEAM REVEAL · {formation?.shapeLabel ?? \"\"}</p><h1>나의 팀 포메이션</h1>{formation && <FormationBoard formation={formation} />}<Link className=\"surface-link\" to=\"/home/team\">나의 팀 공간으로</Link></main></CoreStateBoundary>;\n}\n'''
new_page = '''export function MyTeamFormationPage() {\n  const formation = useFixture(loadFormation);\n  const home = useFixture(loadStadiumHome);\n  const [complete, setComplete] = useState(false);\n  const ready = Boolean(formation && home);\n  return <CoreStateBoundary state={ready ? \"READY\" : \"LOADING\"}>{formation && home ? <main className=\"shell-main team-formation-page\">\n    <header className=\"team-formation-header\">\n      <div>\n        <p className=\"eyebrow\">TEAM REVEAL · {formation.shapeLabel}</p>\n        <h1>나의 팀 포메이션</h1>\n      </div>\n      <p className=\"team-formation-meta\">{home.team.displayName} · 현재 연결된 동료 {formation.teammates.length}명만 실제 데이터 좌표로 표시합니다.</p>\n    </header>\n    <TeamFormation3DScene mode={home.visualMode} formation={formation} onComplete={() => setComplete(true)} />\n    <footer className=\"team-formation-footer\">\n      <p>{complete ? `현재 연결된 ${formation.teammates.length + 1}명의 3D 위치 표시 완료` : \"나의 위치를 기준으로 연결된 동료 위치를 펼치는 중입니다.\"}</p>\n      <Link className=\"surface-link\" to=\"/home/team\">나의 팀 공간으로</Link>\n    </footer>\n  </main> : null}</CoreStateBoundary>;\n}\n'''
if text.count(old_page) != 1:
    raise SystemExit(f'V15.34 team page anchor mismatch: {text.count(old_page)}')
text = text.replace(old_page, new_page, 1)
pages_path.write_text(text)

# 4) Copy wording: do not imply full 11-player completion with partial fixture
scene_path = ROOT / 'apps/web/src/features/stadium/TeamFormation3DScene.tsx'
text = scene_path.read_text()
text = text.replace('progress < 0.35 ? "나의 위치 기준 설정" : progress < 0.82 ? "동료 포지션 펼치는 중" : "현재 연결 포메이션 완성"', 'progress < 0.35 ? "나의 위치 기준 설정" : progress < 0.82 ? "동료 포지션 펼치는 중" : "현재 연결 데이터 표시 완료"')
scene_path.write_text(text)
