import { useEffect, useRef } from "react";
import { X, Bookmark, CheckCircle2 } from "lucide-react";
import type { ArtifactRecord } from "../types";

type Props = { artifact: ArtifactRecord; layerName: string; collected: boolean; onClose: () => void; onCollect: () => void; canCollect: boolean };

export default function ArtifactModal({ artifact, layerName, collected, onClose, onCollect, canCollect }: Props) {
  const modal = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const buttons = modal.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [onClose]);
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section ref={modal} className="artifact-modal" role="dialog" aria-modal="true" aria-labelledby="artifact-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close icon-button" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <div className="artifact-illustration">
          <span>{artifact.name.slice(0, 1)}</span>
          <small>教学模拟发现</small>
        </div>
        <div className="modal-content">
          <div className="eyebrow">模拟发现记录</div>
          <h2 id="artifact-title">{artifact.name}</h2>
          <p>{artifact.features.join("；")}</p>
          <dl className="artifact-facts">
            <div><dt>时代与年代</dt><dd>{artifact.period}；{artifact.dateRange}</dd></div>
            <div><dt>材料与工艺</dt><dd>{artifact.material}；{artifact.technique}</dd></div>
            <div><dt>用途说明</dt><dd>{artifact.use}</dd></div>
            <div><dt>真实发现背景</dt><dd>{artifact.findspot}</dd></div>
            <div><dt>本次模拟层位</dt><dd>{layerName}（仅为教学设定）</dd></div>
          </dl>
          <p className="modal-source">参考入口：<a href={artifact.source.url} target="_blank" rel="noreferrer">{artifact.source.organization} · {artifact.source.title}</a></p>
          <button className="primary-button full" onClick={onCollect} disabled={collected || !canCollect}>
            {collected ? <><CheckCircle2 size={18} /> 已加入研学护照</> : !canCollect ? <>请先在模拟场景中记录发现</> : <><Bookmark size={18} /> 加入研学护照</>}
          </button>
        </div>
      </section>
    </div>
  );
}