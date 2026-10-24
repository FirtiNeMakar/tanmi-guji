import { useEffect, useRef } from "react";
import { X, Bookmark, CheckCircle2 } from "lucide-react";
import type { Artifact } from "../types";
import { translate } from "../i18n";
import type { Language } from "../i18n";

type Props = { artifact: Artifact; collected: boolean; onClose: () => void; onCollect: () => void; canCollect: boolean; language: Language };

export default function ArtifactModal({ artifact, collected, onClose, onCollect, canCollect, language }: Props) {
  const tr = (text: string) => translate(text, language);
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
        <button className="modal-close icon-button" onClick={onClose} aria-label={tr("关闭")}><X size={20} /></button>
        <div className="artifact-illustration">
          <span>{artifact.symbol}</span>
          <small>{tr("仿制教学标本")}</small>
        </div>
        <div className="modal-content">
          <div className="eyebrow">{tr("发现新线索")}</div>
          <h2 id="artifact-title">{tr(artifact.chineseName)}</h2>
          <p className="modal-ru-title">{tr(artifact.name)}</p>
          <p>{tr(artifact.description)}</p>
          <dl className="artifact-facts">
            <div><dt>{tr("材料")}</dt><dd>{tr(artifact.material)}</dd></div>
            <div><dt>{tr("年代")}</dt><dd>{tr(artifact.period)}</dd></div>
            <div><dt>{tr("可能用途")}</dt><dd>{tr(artifact.purpose)}</dd></div>
            <div><dt>{tr("出土层位")}</dt><dd>{language === "ru" ? `Слой ${artifact.layer}` : `第 ${artifact.layer} 层`}</dd></div>
          </dl>
          <button className="primary-button full" onClick={onCollect} disabled={collected || !canCollect}>
            {collected ? <><CheckCircle2 size={18} /> {tr("已收入图鉴")}</> : !canCollect ? <>{tr("请先前往云探方发现此文物")}</> : <><Bookmark size={18} /> {tr("收入研学图鉴")}</>}
          </button>
        </div>
      </section>
    </div>
  );
}