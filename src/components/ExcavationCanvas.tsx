import { useEffect, useRef, useState } from "react";
import { Hand, RotateCcw, Sparkles } from "lucide-react";
import type { Artifact, Layer } from "../types";

type Props = {
  layers: Layer[];
  progress: number;
  onProgress: (value: number) => void;
  artifacts: Artifact[];
  foundIds: string[];
  onFound: (artifact: Artifact) => void;
  onLayerChange: (layer: number) => void;
};

export default function ExcavationCanvas({ layers, artifacts, foundIds, onFound, onLayerChange, progress: revealed, onProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(revealed);
  progressRef.current = revealed;
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hint, setHint] = useState("用手指刮开泥土");

  useEffect(() => { onLayerChange(revealed < 34 ? 1 : revealed < 68 ? 2 : 3); }, []);

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
    ctx.clearRect(0, 0, rect.width, rect.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, "#D9BC91");
    gradient.addColorStop(0.34, "#B7835C");
    gradient.addColorStop(0.68, "#986B4C");
    gradient.addColorStop(1, "#80563F");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    for (let i = 0; i < 170; i++) {
      const x = (i * 73.17) % rect.width;
      const y = (i * 37.91) % rect.height;
      ctx.fillStyle = i % 2 ? "rgba(74,48,31,.12)" : "rgba(255,238,205,.2)";
      ctx.beginPath();
      ctx.arc(x, y, (i % 3) + 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    [0.34, 0.68].forEach((ratio) => {
      ctx.strokeStyle = "rgba(70,45,29,.28)";
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(0, rect.height * ratio);
      ctx.lineTo(rect.width, rect.height * ratio);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(50,40,30,.12)";
    ctx.fillRect(0, 0, rect.width, Math.min(rect.height, revealed * rect.height / 100));
  }, [revealed]);

  const reveal = (event?: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (event) {
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (event.type === 'pointermove' && lastPoint.current && Math.hypot(point.x - lastPoint.current.x, point.y - lastPoint.current.y) < 6) return;
      lastPoint.current = point;
    }
    const next = Math.min(100, progressRef.current + 2.2);
    progressRef.current = next;
    onProgress(next);
    const layerIndex = Math.min(2, Math.floor((next / 100) * 3));
    onLayerChange(layers[layerIndex]?.id ?? 1);
    if (next > 30 && !foundIds.includes("pottery-01")) {
      setHint("发现陶片线索！点击下方卡片查看");
    } else if (next > 68 && !foundIds.includes("coin-01")) {
      setHint("更深处还有线索");
    } else {
      setHint(next >= 100 ? "本次探方已完成" : "继续仔细发掘");
    }
    if (navigator.vibrate) navigator.vibrate(12);
  };

  const visibleArtifacts = artifacts.filter((artifact) => {
    if (artifact.id === "pottery-01") return revealed >= 28;
    if (artifact.id === "coin-01") return revealed >= 65;
    return revealed >= 82;
  });

  return (
    <div className="dig-game">
      <div className="dig-toolbar">
        <span className="live-dot" /> <span>探方 A-01</span>
        <span className="toolbar-separator">·</span>
        <span>模拟发掘</span>
        <button className="tiny-reset" onClick={() => { onProgress(0); onLayerChange(1); setIsDragging(false); setHint("用手指刮开泥土"); }} aria-label="重新开始"><RotateCcw size={15} /></button>
      </div>
      <div className="excavation-frame">
        <div className="frame-label top-left">北 ↑</div>
        <div className="frame-label top-right">A-01 / 2026</div>
        <canvas
          ref={canvasRef}
          className={`soil-canvas ${isDragging ? "dragging" : ""}`}
          onPointerDown={(e) => { setIsDragging(true); e.currentTarget.setPointerCapture(e.pointerId); reveal(e); }}
          onPointerMove={(e) => { if (isDragging) reveal(e); }}
          onPointerUp={() => { setIsDragging(false); lastPoint.current = null; }}
          onLostPointerCapture={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          aria-label="交互土层，用鼠标或手指刮开泥土。"
        />
        {visibleArtifacts.map((artifact, i) => (
          <button
            key={artifact.id}
            className={`buried-artifact artifact-${i}`}
            style={{ top: artifact.id === "pottery-01" ? "38%" : artifact.id === "coin-01" ? "70%" : "84%" }}
            onClick={() => onFound(artifact)}
            aria-label={`查看 ${artifact.name}`}
          >
            <span>{artifact.symbol}</span>
            <small>{foundIds.includes(artifact.id) ? "已发现" : "线索"}</small>
          </button>
        ))}
        <div className="depth-ruler"><span>0</span><span>20</span><span>45</span><span>70 厘米</span></div>
        <div className="canvas-instruction"><Hand size={16} /> {hint}</div>
      </div>
      <button className="secondary-button full" disabled={revealed >= 100} onClick={() => reveal()}>继续发掘</button>
      <div className="dig-stats">
        <div><span>发掘进度</span><strong>{Math.round(revealed)}%</strong><div className="mini-track"><i style={{ width: `${revealed}%` }} /></div></div>
        <div><span>已发现线索</span><strong>{foundIds.length} / 3</strong><div className="mini-track"><i style={{ width: `${(foundIds.length / 3) * 100}%` }} /></div></div>
      </div>
      <div className="found-list">
        <div className="subsection-title"><Sparkles size={16} /> 已出现的线索 <span>点击查看详情</span></div>
        {visibleArtifacts.length === 0 ? <p className="empty-hint">轻轻刮开土层，寻找隐藏的器物。<br />逐步清理土层，留意出土背景。</p> :
          visibleArtifacts.map((artifact) => (
            <button key={artifact.id} className="found-row" onClick={() => onFound(artifact)}>
              <span className="found-symbol">{artifact.symbol}</span>
              <span className="found-copy"><strong>{artifact.chineseName}</strong><small>{artifact.name}</small></span>
              <span className="found-action">{foundIds.includes(artifact.id) ? "查看 →" : "研究 →"}</span>
            </button>
          ))}
      </div>
    </div>
  );
}