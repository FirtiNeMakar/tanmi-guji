import { useEffect, useRef } from "react";
import { X, Bookmark, CheckCircle2 } from "lucide-react";
import type { Artifact } from "../types";

type Props = { artifact: Artifact; collected: boolean; onClose: () => void; onCollect: () => void; canCollect: boolean };

export default function ArtifactModal({ artifact, collected, onClose, onCollect, canCollect }: Props) {
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
          <span>{artifact.symbol}</span>
          <small>仿制教学标本</small>
        </div>
        <div className="modal-content">
          <div className="eyebrow">发现新线索</div>
          <h2 id="artifact-title">{artifact.chineseName}</h2>
          <p className="modal-ru-title">{artifact.name}</p>
          <p>{artifact.description}</p>
          <dl className="artifact-facts">
            <div><dt>材料</dt><dd>{artifact.material}</dd></div>
            <div><dt>年代</dt><dd>{artifact.period}</dd></div>
            <div><dt>可能用途</dt><dd>{artifact.purpose}</dd></div>
            <div><dt>出土层位</dt><dd>第 {artifact.layer} 层</dd></div>
          </dl>
          <button className="primary-button full" onClick={onCollect} disabled={collected || !canCollect}>
            {collected ? <><CheckCircle2 size={18} /> 已收入图鉴</> : !canCollect ? <>请先前往云探方发现此文物</> : <><Bookmark size={18} /> 收入研学图鉴</>}
          </button>
        </div>
      </section>
    </div>
  );
}