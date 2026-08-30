from pathlib import Path

BASE = Path('apps/web/src/three/stadiumWebglV14.ts')
WRAPPER = Path('apps/web/src/three/stadiumWebglV151.ts')
PAGES = Path('apps/web/src/features/stadium/PlayerStadiumPages.tsx')

base = BASE.read_text()

old_interface = '''  render(orbit: number, zoom: number): void;\n  renderApproach?(progress: number): void;\n  destroy(): void;'''
new_interface = '''  render(orbit: number, zoom: number): void;\n  renderApproach?(progress: number): void;\n  renderPitchEntry?(progress: number): void;\n  destroy(): void;'''
if base.count(old_interface) != 1:
    raise SystemExit(f'interface anchor mismatch: {base.count(old_interface)}')
base = base.replace(old_interface, new_interface, 1)

approach_anchor = '''  const triangleCount = countTriangles(stadium);'''
pitch_entry = '''  const renderPitchEntry = (progress0: number) => {\n    const progress = THREE.MathUtils.clamp(progress0, 0, 1);\n    const eased = progress * progress * (3 - 2 * progress);\n    const portrait = cssWidth / cssHeight < 0.82;\n    camera.aspect = cssWidth / cssHeight;\n    camera.zoom = 1;\n\n    const bowl = portrait\n      ? new THREE.Vector3(49, 32, 59)\n      : new THREE.Vector3(43, 27, 49);\n    const touchline = portrait\n      ? new THREE.Vector3(19, 10.5, 39)\n      : new THREE.Vector3(22, 9.5, 36);\n    const pitch = portrait\n      ? new THREE.Vector3(1.8, 2.45, 30.5)\n      : new THREE.Vector3(5.8, 2.25, 29.5);\n\n    const bowlTarget = new THREE.Vector3(-2, 9, -18);\n    const touchlineTarget = new THREE.Vector3(0, 3.4, -5);\n    const pitchTarget = new THREE.Vector3(0, 1.1, -16);\n    const cameraPosition = new THREE.Vector3();\n    const lookTarget = new THREE.Vector3();\n\n    if (eased < 0.52) {\n      const t = eased / 0.52;\n      const local = t * t * (3 - 2 * t);\n      cameraPosition.lerpVectors(bowl, touchline, local);\n      lookTarget.lerpVectors(bowlTarget, touchlineTarget, local);\n    } else {\n      const t = (eased - 0.52) / 0.48;\n      const local = t * t * (3 - 2 * t);\n      cameraPosition.lerpVectors(touchline, pitch, local);\n      lookTarget.lerpVectors(touchlineTarget, pitchTarget, local);\n    }\n\n    camera.fov = portrait\n      ? THREE.MathUtils.lerp(63, 69, eased)\n      : THREE.MathUtils.lerp(58, 66, eased);\n    camera.position.copy(cameraPosition);\n    camera.lookAt(lookTarget);\n    camera.updateProjectionMatrix();\n    stadium.rotation.y = -0.015;\n    renderer.render(scene, camera);\n  };\n\n'''
if base.count(approach_anchor) != 1:
    raise SystemExit(f'pitch entry insertion anchor mismatch: {base.count(approach_anchor)}')
base = base.replace(approach_anchor, pitch_entry + approach_anchor, 1)

old_return = '''  return { triangleCount, resize, render, renderApproach, destroy };'''
new_return = '''  return { triangleCount, resize, render, renderApproach, renderPitchEntry, destroy };'''
if base.count(old_return) != 1:
    raise SystemExit(f'return anchor mismatch: {base.count(old_return)}')
base = base.replace(old_return, new_return, 1)
BASE.write_text(base)

wrapper = WRAPPER.read_text()
old_wrapper = '''    renderApproach(progress: number) {\n      base.renderApproach?.(progress);\n    },\n    destroy() {'''
new_wrapper = '''    renderApproach(progress: number) {\n      base.renderApproach?.(progress);\n    },\n    renderPitchEntry(progress: number) {\n      base.renderPitchEntry?.(progress);\n    },\n    destroy() {'''
if wrapper.count(old_wrapper) != 1:
    raise SystemExit(f'wrapper anchor mismatch: {wrapper.count(old_wrapper)}')
wrapper = wrapper.replace(old_wrapper, new_wrapper, 1)
WRAPPER.write_text(wrapper)

pages = PAGES.read_text()
old_import = '''import { StadiumApproachScene } from "./StadiumApproachScene";\nimport "./stadium.css";\nimport "./stadiumApproach.css";'''
new_import = '''import { StadiumApproachScene } from "./StadiumApproachScene";\nimport { PitchEntryScene } from "./PitchEntryScene";\nimport "./stadium.css";\nimport "./stadiumApproach.css";\nimport "./pitchEntry.css";'''
if pages.count(old_import) != 1:
    raise SystemExit(f'import anchor mismatch: {pages.count(old_import)}')
pages = pages.replace(old_import, new_import, 1)

old_page = '''export function PitchEntryPage() { return <main className="shell-main"><p className="eyebrow">STADIUM EXPERIENCE · PITCH ENTRY</p><h1>피치 진입</h1><StaticScene label="피치 진입" /><Link className="surface-link" to="/home/position">나의 포지션 보기</Link></main>; }'''
new_page = '''export function PitchEntryPage() {\n  const home = useFixture(loadStadiumHome);\n  const [complete, setComplete] = useState(false);\n  return <CoreStateBoundary state={home ? "READY" : "LOADING"}>{home ? <main className="shell-main pitch-entry-page">\n    <header className="pitch-entry-header">\n      <div>\n        <p className="eyebrow">STADIUM EXPERIENCE · PITCH ENTRY</p>\n        <h1>피치 진입</h1>\n      </div>\n      <p className="pitch-entry-meta">{home.team.displayName} · 상단 bowl 시점에서 터치라인을 지나 실제 피치 레벨까지 내려갑니다.</p>\n    </header>\n    <PitchEntryScene mode={home.visualMode} onComplete={() => setComplete(true)} />\n    <footer className="pitch-entry-footer">\n      <p>{complete ? "3D 카메라가 피치 레벨에 도착했습니다." : "경기장 내부에서 피치로 내려가는 중입니다."}</p>\n      <Link className="surface-link" to="/home/position">나의 포지션 보기</Link>\n    </footer>\n  </main> : null}</CoreStateBoundary>;\n}'''
if pages.count(old_page) != 1:
    raise SystemExit(f'pitch page anchor mismatch: {pages.count(old_page)}')
pages = pages.replace(old_page, new_page, 1)
PAGES.write_text(pages)
