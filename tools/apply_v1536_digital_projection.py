from pathlib import Path

ROOT = Path('.')

renderer_path = ROOT / 'apps/web/src/three/stadiumWebglV14.ts'
text = renderer_path.read_text()
old = '  renderTeamFormation?(progress: number, ownX: number, ownZ: number, teammates: readonly StadiumTeamMarker[]): void;\n  destroy(): void;'
new = '  renderTeamFormation?(progress: number, ownX: number, ownZ: number, teammates: readonly StadiumTeamMarker[]): void;\n  renderDigitalProjection?(progress: number): void;\n  destroy(): void;'
if text.count(old) != 1:
    raise SystemExit(f'V15.36 interface anchor mismatch: {text.count(old)}')
text = text.replace(old, new, 1)

anchor = '''  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, 380);\n'''
projection_setup = '''  const projectionRoot = new THREE.Group();\n  projectionRoot.visible = false;\n  stadium.add(projectionRoot);\n  const projectionRingMaterial = addDisposable(\n    materials,\n    new THREE.MeshStandardMaterial({\n      color: 0x75dcff,\n      emissive: 0x27bfff,\n      emissiveIntensity: 2.4,\n      roughness: 0.30,\n      metalness: 0.12,\n      transparent: true,\n      opacity: 0.0,\n      depthWrite: false,\n    }),\n  );\n  const projectionBeamMaterial = addDisposable(\n    materials,\n    new THREE.MeshBasicMaterial({\n      color: 0x8ee7ff,\n      transparent: true,\n      opacity: 0.0,\n      depthWrite: false,\n      blending: THREE.AdditiveBlending,\n      side: THREE.DoubleSide,\n    }),\n  );\n  const projectionDiscMaterial = addDisposable(\n    materials,\n    new THREE.MeshBasicMaterial({\n      color: 0x159bd2,\n      transparent: true,\n      opacity: 0.0,\n      depthWrite: false,\n      blending: THREE.AdditiveBlending,\n      side: THREE.DoubleSide,\n    }),\n  );\n  for (const radius of [4.5, 8.0, 12.5]) {\n    const ringGeometry = addDisposable(geometries, new THREE.TorusGeometry(radius, 0.065, 6, 72));\n    const ring = new THREE.Mesh(ringGeometry, projectionRingMaterial);\n    ring.rotation.x = Math.PI / 2;\n    ring.position.y = 0.14 + radius * 0.006;\n    projectionRoot.add(ring);\n  }\n  const projectionDiscGeometry = addDisposable(geometries, new THREE.CircleGeometry(10.8, 72));\n  const projectionDisc = new THREE.Mesh(projectionDiscGeometry, projectionDiscMaterial);\n  projectionDisc.rotation.x = -Math.PI / 2;\n  projectionDisc.position.y = 0.10;\n  projectionRoot.add(projectionDisc);\n  const projectionBeamGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.06, 0.28, 8.5, 10, 1, true));\n  for (let i = 0; i < 8; i += 1) {\n    const angle = (i / 8) * TAU;\n    const beam = new THREE.Mesh(projectionBeamGeometry, projectionBeamMaterial);\n    beam.position.set(Math.cos(angle) * 8.2, 4.3, Math.sin(angle) * 8.2);\n    projectionRoot.add(beam);\n  }\n  const projectionCoreGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.3, 2.4, 10.5, 28, 1, true));\n  const projectionCore = new THREE.Mesh(projectionCoreGeometry, projectionBeamMaterial);\n  projectionCore.position.y = 5.3;\n  projectionRoot.add(projectionCore);\n  projectionRoot.scale.setScalar(0.001);\n\n  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, 380);\n'''
if text.count(anchor) != 1:
    raise SystemExit(f'V15.36 projection setup anchor mismatch: {text.count(anchor)}')
text = text.replace(anchor, projection_setup, 1)

anchor = '''  const triangleCount = countTriangles(stadium);\n'''
projection_render = '''  const renderDigitalProjection = (progress0: number) => {\n    const progress = THREE.MathUtils.clamp(progress0, 0, 1);\n    const eased = progress * progress * (3 - 2 * progress);\n    const portrait = cssWidth / cssHeight < 0.82;\n    camera.aspect = cssWidth / cssHeight;\n    camera.zoom = 1;\n\n    positionMarker.visible = false;\n    teamFormationRoot.visible = false;\n    projectionRoot.visible = progress > 0.02;\n    const reveal = THREE.MathUtils.smoothstep(progress, 0.04, 0.72);\n    projectionRoot.scale.setScalar(Math.max(0.001, THREE.MathUtils.lerp(0.34, 1.0, reveal)));\n    projectionRoot.rotation.y = (1 - eased) * -0.16;\n    projectionRingMaterial.opacity = 0.10 + reveal * 0.72;\n    projectionBeamMaterial.opacity = 0.04 + reveal * 0.32;\n    projectionDiscMaterial.opacity = 0.015 + reveal * 0.11;\n    projectionRingMaterial.emissiveIntensity = 1.4 + reveal * 2.2;\n    projectionRoot.children.forEach((child, index) => {\n      if (index < 3) child.rotation.z = progress * (0.16 + index * 0.08) * (index % 2 == 0 ? 1 : -1);\n    });\n\n    const start = portrait\n      ? new THREE.Vector3(1.8, 2.45, 30.5)\n      : new THREE.Vector3(5.8, 2.25, 29.5);\n    const focus = portrait\n      ? new THREE.Vector3(24, 16.5, 33)\n      : new THREE.Vector3(31, 14.5, 30);\n    const startTarget = new THREE.Vector3(0, 1.1, -16);\n    const focusTarget = new THREE.Vector3(0, 3.0, 0);\n    camera.position.lerpVectors(start, focus, eased);\n    const lookTarget = new THREE.Vector3().lerpVectors(startTarget, focusTarget, eased);\n    camera.lookAt(lookTarget);\n    camera.fov = portrait\n      ? THREE.MathUtils.lerp(69, 61, eased)\n      : THREE.MathUtils.lerp(66, 57, eased);\n    camera.updateProjectionMatrix();\n    stadium.rotation.y = -0.015;\n    renderer.render(scene, camera);\n  };\n\n  const triangleCount = countTriangles(stadium);\n'''
if text.count(anchor) != 1:
    raise SystemExit(f'V15.36 render anchor mismatch: {text.count(anchor)}')
text = text.replace(anchor, projection_render, 1)

old_return = '  return { triangleCount, resize, render, renderApproach, renderPitchEntry, renderPlayerPosition, renderTeamFormation, destroy };'
new_return = '  return { triangleCount, resize, render, renderApproach, renderPitchEntry, renderPlayerPosition, renderTeamFormation, renderDigitalProjection, destroy };'
if text.count(old_return) != 1:
    raise SystemExit(f'V15.36 return anchor mismatch: {text.count(old_return)}')
text = text.replace(old_return, new_return, 1)
renderer_path.write_text(text)

wrapper_path = ROOT / 'apps/web/src/three/stadiumWebglV151.ts'
text = wrapper_path.read_text()
old = '''    renderTeamFormation(progress: number, ownX: number, ownZ: number, teammates) {\n      base.renderTeamFormation?.(progress, ownX, ownZ, teammates);\n    },\n    destroy() {\n'''
new = '''    renderTeamFormation(progress: number, ownX: number, ownZ: number, teammates) {\n      base.renderTeamFormation?.(progress, ownX, ownZ, teammates);\n    },\n    renderDigitalProjection(progress: number) {\n      base.renderDigitalProjection?.(progress);\n    },\n    destroy() {\n'''
if text.count(old) != 1:
    raise SystemExit(f'V15.36 wrapper anchor mismatch: {text.count(old)}')
wrapper_path.write_text(text.replace(old, new, 1))

pages_path = ROOT / 'apps/web/src/features/stadium/PlayerStadiumPages.tsx'
text = pages_path.read_text()
import_anchor = 'import { SpatialHome3DScene } from "./SpatialHome3DScene";\n'
if text.count(import_anchor) != 1:
    raise SystemExit(f'V15.36 page import anchor mismatch: {text.count(import_anchor)}')
text = text.replace(import_anchor, import_anchor + 'import { DigitalProjectionScene } from "./DigitalProjectionScene";\n', 1)
css_anchor = 'import "./spatialHome3D.css";\n'
if text.count(css_anchor) != 1:
    raise SystemExit(f'V15.36 page css anchor mismatch: {text.count(css_anchor)}')
text = text.replace(css_anchor, css_anchor + 'import "./digitalProjection.css";\n', 1)
old_link = '<Link className="surface-link" to="/home/position">나의 포지션 보기</Link>'
new_link = '<Link className="surface-link" to="/home/projection">디지털 프로젝션 보기</Link>'
if text.count(old_link) != 1:
    raise SystemExit(f'V15.36 pitch link anchor mismatch: {text.count(old_link)}')
text = text.replace(old_link, new_link, 1)
page_anchor = '''function PositionAccessibilityContract({ formation }: { formation: CoreFormation }) {\n'''
new_page = '''export function DigitalProjectionPage() {\n  const home = useFixture(loadStadiumHome);\n  const formation = useFixture(loadFormation);\n  const [complete, setComplete] = useState(false);\n  const ready = Boolean(home && formation);\n  return <CoreStateBoundary state={ready ? "READY" : "LOADING"}>{home && formation ? <main className="shell-main digital-projection-page">\n    <header className="digital-projection-header">\n      <div>\n        <p className="eyebrow">STADIUM EXPERIENCE · DIGITAL PROJECTION</p>\n        <h1>디지털 프로젝션</h1>\n      </div>\n      <p className="digital-projection-meta">{home.team.displayName} · 실제 피치 위에 현재 연결된 선수·포메이션·팀 상태 레이어를 투영합니다.</p>\n    </header>\n    <DigitalProjectionScene mode={home.visualMode} home={home} formation={formation} onComplete={() => setComplete(true)} />\n    <footer className="digital-projection-footer">\n      <p>{complete ? "3D 디지털 레이어 투영 완료" : "피치 위에 현재 데이터 레이어를 투영하는 중입니다."}</p>\n      <Link className="surface-link" to="/home/position">나의 포지션 보기</Link>\n    </footer>\n  </main> : null}</CoreStateBoundary>;\n}\n\nfunction PositionAccessibilityContract({ formation }: { formation: CoreFormation }) {\n'''
if text.count(page_anchor) != 1:
    raise SystemExit(f'V15.36 page insertion anchor mismatch: {text.count(page_anchor)}')
text = text.replace(page_anchor, new_page, 1)
pages_path.write_text(text)

app_path = ROOT / 'apps/web/src/app/AppShell.tsx'
text = app_path.read_text()
old_import = 'import { MyPositionPage, MyTeamFormationPage, PitchEntryPage, SpatialHomePage, StadiumApproachPage, StadiumExteriorPage } from "../features/stadium/PlayerStadiumPages";'
new_import = 'import { DigitalProjectionPage, MyPositionPage, MyTeamFormationPage, PitchEntryPage, SpatialHomePage, StadiumApproachPage, StadiumExteriorPage } from "../features/stadium/PlayerStadiumPages";'
if text.count(old_import) != 1:
    raise SystemExit(f'V15.36 app import anchor mismatch: {text.count(old_import)}')
text = text.replace(old_import, new_import, 1)
route_anchor = '    <Route path="/home/enter" element={<PitchEntryPage />} />\n    <Route path="/home/position" element={<MyPositionPage />} />'
route_new = '    <Route path="/home/enter" element={<PitchEntryPage />} />\n    <Route path="/home/projection" element={<DigitalProjectionPage />} />\n    <Route path="/home/position" element={<MyPositionPage />} />'
if text.count(route_anchor) != 1:
    raise SystemExit(f'V15.36 route anchor mismatch: {text.count(route_anchor)}')
app_path.write_text(text.replace(route_anchor, route_new, 1))
