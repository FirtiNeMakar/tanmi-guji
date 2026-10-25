import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { artifacts } from "../data/artifacts";
import { restorationTasks } from "../data/restoration";
import { placeRestorationPiece, resetRestorationTask } from "../progress";
import type { SavedState } from "../progress";

type Props = { saved: SavedState; updateSaved: (updater: (current: SavedState) => SavedState) => void };

export default function RestorationWorkshop({ saved, updateSaved }: Props) {
  const [taskId, setTaskId] = useState(restorationTasks[0].id);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const task = restorationTasks.find(({ id }) => id === taskId) ?? restorationTasks[0];
  const placed = saved.restorationPieces[task.id] ?? [];
  const completed = placed.length === task.fragments.length;
  const artifact = artifacts.find(({ id }) => id === task.artifactId);

  const chooseTask = (id: string) => {
    setTaskId(id);
    setSelectedPiece(null);
    setFeedback("");
  };

  const placeOnTarget = (target: string) => {
    if (!selectedPiece) {
      setFeedback("请先选择一块构件，再选择对应的位置。");
      return;
    }
    const fragment = task.fragments.find(({ id }) => id === selectedPiece);
    if (!fragment || fragment.target !== target) {
      setFeedback("位置不匹配。请观察构件形状和结构关系后再试。");
      return;
    }
    updateSaved((current) => placeRestorationPiece(current, task.id, fragment.id, target));
    setSelectedPiece(null);
    setFeedback("放置正确。每项修复任务的积分只发放一次。");
  };

  return (
    <>
      <div className="hub-nav restoration-task-nav" aria-label="选择修复任务">
        {restorationTasks.map((item, index) => (
          <button key={item.id} className={item.id === task.id ? "active" : ""} onClick={() => chooseTask(item.id)}>
            {index + 1}. {item.title}{saved.completedRestorationIds.includes(item.id) ? " ✓" : ""}
          </button>
        ))}
      </div>
      <section className="content-card">
        <strong>{task.title}</strong>
        <p>{task.background}</p>
        <small>{task.rule}</small>
        <div className="restoration-targets">
          {task.fragments.map((fragment) => (
            <button
              key={fragment.id}
              className={`restoration-target ${placed.includes(fragment.id) ? "placed" : ""}`}
              disabled={placed.includes(fragment.id)}
              onClick={() => placeOnTarget(fragment.target)}
            >
              <span>{placed.includes(fragment.id) ? <Check size={18} /> : fragment.symbol}</span>
              <strong>{fragment.target}</strong>
            </button>
          ))}
        </div>
        <p className="restoration-tip" role="status">{feedback || (completed ? "教学拼合已完成。" : "选择碎片，再点击正确的目标位置。")}</p>
      </section>
      <div className="piece-tray">
        {task.fragments.map((fragment) => (
          <button
            key={fragment.id}
            className={`piece-card ${placed.includes(fragment.id) ? "piece-done" : ""}`}
            aria-pressed={selectedPiece === fragment.id}
            disabled={placed.includes(fragment.id)}
            onClick={() => {
              setSelectedPiece(fragment.id);
              setFeedback(`已选择“${fragment.name}”，请选择${fragment.target}。`);
            }}
          >
            <span className={`piece-shape ${fragment.id}`}>{placed.includes(fragment.id) ? <Check size={20} /> : fragment.symbol}</span>
            <strong>{fragment.name}</strong>
            <small>{placed.includes(fragment.id) ? "已放置" : "点击选择"}</small>
          </button>
        ))}
      </div>
      <button className="secondary-button full" onClick={() => {
        updateSaved((current) => resetRestorationTask(current, task.id));
        setSelectedPiece(null);
        setFeedback("练习已重置；已领取的积分不会重复发放。");
      }}><RotateCcw size={16} /> 重新练习</button>
      {completed && artifact && (
        <section className="learning-card">
          <h3>文物知识卡：{artifact.name}</h3>
          <p>{artifact.period}；{artifact.findspot}。{artifact.use}</p>
          <small>修复提示：{task.explanation}</small>
        </section>
      )}
    </>
  );
}
