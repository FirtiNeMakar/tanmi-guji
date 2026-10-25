import { useEffect, useRef, useState } from "react";
import { Hand, RotateCcw, Sparkles } from "lucide-react";
import { artifacts } from "../data/artifacts";
import type { ArtifactRecord, ExcavationScene } from "../types";

type Props = {
  scene: ExcavationScene;
  progress: number;
  foundIds: string[];
  onProgress: (value: number) => void;
  onFound: (artifact: ArtifactRecord, layerId: string) => void;
  onLayerChange: (layer: number) => void;
  onReset: () => void;
};

export default function ExcavationCanvas({ scene, foundIds, onFound, onLayerChange, progress, onProgress, onReset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hint, setHint] = useState("用手指或鼠标轻轻清理土层");

  const layerIndexAt = (value: number) => Math.min(scene.layers.length - 1, Math.floor((value / 100) * scene.layers.length));
  const currentLayerIndex = layerIndexAt(progress);
  const availableFinds = scene.layers.slice(0, currentLayerIndex + 1)
    .flatMap((layer) => layer.artifactIds.map((artifactId) => ({ artifact: artifacts.find(({ id }) => id === artifactId), layer })))
    .filter((entry): entry is { artifact: ArtifactRecord; layer: ExcavationScene["layers"][number] } => Boolean(entry.artifact));

  useEffect(() => {
    onLayerChange(currentLayerIndex + 1);
  }, [currentLayerIndex, onLayerChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.scale(dpr, dpr);
    const height = rect.height / scene.layers.length;
    const soilColors = ["#D9BC91", "#B7835C", "#986B4C", "#80563F"];
    scene.layers.forEach((_, index) => {
      ctx.fillStyle = soilColors[index % soilColors.length];
      ctx.fillRect(0, index * height, rect.width, height + 1);
      for (let speck = 0; speck < 38; speck++) {
        const x = ((speck * 73.17) + index * 19) % rect.width;
        const y = (index * height) + ((speck * 37.91) % height);
        ctx.fillStyle = speck % 2 ? "rgba(74,48,31,.12)" : "rgba(255,238,205,.2)";
        ctx.beginPath();
        ctx.arc(x, y, (speck % 3) + 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (index > 0) {
        ctx.strokeStyle = "rgba(70,45,29,.35)";
        ctx.setLineDash([5, 6]);
        ctx.beginPath();
        ctx.moveTo(0, index * height);
        ctx.lineTo(rect.width, index * height);
        ctx.stroke();
      }
    });
    ctx.setLineDash([]);
    const cleanedHeight = rect.height * progress / 100;
    ctx.fillStyle = "rgba(50,40,30,.32)";
    ctx.fillRect(0, cleanedHeight, rect.width, rect.height - cleanedHeight);
  }, [progress, scene]);

  const reveal = (event?: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || progressRef.current >= 100) return;
    if (event) {
      const rect = canvas.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (event.type === "pointermove" && lastPoint.current && Math.hypot(point.x - lastPoint.current.x, point.y - lastPoint.current.y) < 6) return;
      lastPoint.current = point;
    }
    const next = Math.min(100, progressRef.current + 2.2);
    progressRef.current = next;
    onProgress(next);
    onLayerChange(layerIndexAt(next) + 1);
    setHint(next >= 100 ? "已清理全部模拟层，请检查并记录发现物" : "继续清理，留意不同层位的材料");
    if (navigator.vibrate) navigator.vibrate(12);
  };

  return (
    <div className="dig-game">
      <div className="dig-toolbar">
        <span className="live-dot" /> <span>{scene.title}</span>
        <span className="toolbar-separator">·</span>
        <span>教学模拟</span>
        <button className="tiny-reset" onClick={onReset} aria-label="重新开始本场景"><RotateCcw size={15} /></button>
      </div>
      <div className="excavation-frame">
        <div className="frame-label top-left">教学探方</div>
        <div className="frame-label top-right">非真实遗址记录</div>
        <canvas
          ref={canvasRef}
          className={`soil-canvas ${isDragging ? "dragging" : ""}`}
          onPointerDown={(event) => { setIsDragging(true); event.currentTarget.setPointerCapture(event.pointerId); reveal(event); }}
          onPointerMove={(event) => { if (isDragging) reveal(event); }}
          onPointerUp={() => { setIsDragging(false); lastPoint.current = null; }}
          onLostPointerCapture={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          aria-label="交互土层，可用鼠标或手指逐层清理。"
        />
        {availableFinds.map(({ artifact, layer }, index) => {
          const layerIndex = scene.layers.findIndex(({ id }) => id === layer.id);
          const top = `${((layerIndex + 0.52) / scene.layers.length) * 100}%`;
          return (
            <button
              key={artifact.id}
              className={`buried-artifact artifact-${index % 3}`}
              style={{ top }}
              onClick={() => onFound(artifact, layer.id)}
              aria-label={`查看${artifact.name}，教学模拟层位：${layer.name}`}
            >
              <span>{artifact.name.slice(0, 1)}</span>
              <small>{foundIds.includes(artifact.id) ? "已记录" : "线索"}</small>
            </button>
          );
        })}
        <div className="depth-ruler">{scene.layers.map(({ depth, id }) => <span key={id}>{depth}</span>)}</div>
        <div className="canvas-instruction"><Hand size={16} /> {hint}</div>
      </div>
      <button className="secondary-button full" disabled={progress >= 100} onClick={() => reveal()}>继续清理土层</button>
      <div className="dig-stats">
        <div><span>场景进度</span><strong>{Math.round(progress)}%</strong><div className="mini-track"><i style={{ width: `${progress}%` }} /></div></div>
        <div><span>已记录发现</span><strong>{foundIds.length} / {scene.artifactIds.length}</strong><div className="mini-track"><i style={{ width: `${(foundIds.length / scene.artifactIds.length) * 100}%` }} /></div></div>
      </div>
      <div className="found-list">
        <div className="subsection-title"><Sparkles size={16} /> 已出现的教学材料 <span>点击查看详情</span></div>
        {availableFinds.length === 0 ? <p className="empty-hint">轻轻清理土层，观察模拟出土背景。<br />场景中的层位仅用于教学练习。</p> :
          availableFinds.map(({ artifact, layer }) => (
            <button key={artifact.id} className="found-row" onClick={() => onFound(artifact, layer.id)}>
              <span className="found-symbol">{artifact.name.slice(0, 1)}</span>
              <span className="found-copy"><strong>{artifact.name}</strong><small>模拟层位：{layer.name}（{layer.depth}）</small></span>
              <span className="found-action">{foundIds.includes(artifact.id) ? "已记录 →" : "记录 →"}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
