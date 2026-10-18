import { X, Bookmark, CheckCircle2 } from "lucide-react";
import type { Artifact } from "../types";

type Props = { artifact: Artifact; collected: boolean; onClose: () => void; onCollect: () => void };

export default function ArtifactModal({ artifact, collected, onClose, onCollect }: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="artifact-modal" role="dialog" aria-modal="true" aria-labelledby="artifact-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close icon-button" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <div className="artifact-illustration">
          <span>{artifact.symbol}</span>
          <small>仿制教学标本 · Учебная реплика</small>
        </div>
        <div className="modal-content">
          <div className="eyebrow">发现新线索 · НОВАЯ НАХОДКА</div>
          <h2 id="artifact-title">{artifact.chineseName}</h2>
          <p className="modal-ru-title">{artifact.name}</p>
          <p>{artifact.description}</p>
          <dl className="artifact-facts">
            <div><dt>材料 · Материал</dt><dd>{artifact.material}</dd></div>
            <div><dt>年代 · Период</dt><dd>{artifact.period}</dd></div>
            <div><dt>可能用途 · Возможная функция</dt><dd>{artifact.purpose}</dd></div>
            <div><dt>出土层位 · Слой</dt><dd>第 {artifact.layer} 层 / Слой {artifact.layer}</dd></div>
          </dl>
          <button className="primary-button full" onClick={onCollect} disabled={collected}>
            {collected ? <><CheckCircle2 size={18} /> 已收入图鉴 · Уже в каталоге</> : <><Bookmark size={18} /> 收入研学图鉴 · Добавить в каталог</>}
          </button>
        </div>
      </section>
    </div>
  );
}