import { Compass, House, Layers3, LibraryBig, Stamp } from "lucide-react";
import type { TabId } from "../types";

type Props = { active: TabId; onChange: (tab: TabId) => void };

const items: { id: TabId; label: string; ru: string; icon: typeof House }[] = [
  { id: "home", label: "首页", ru: "Главная", icon: House },
  { id: "dig", label: "云探方", ru: "Раскопки", icon: Layers3 },
  { id: "restore", label: "修复", ru: "Реставрация", icon: Compass },
  { id: "passport", label: "护照", ru: "Паспорт", icon: Stamp },
  { id: "discover", label: "博古通今", ru: "Знания", icon: LibraryBig },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map(({ id, label, ru, icon: Icon }) => (
        <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => onChange(id)}>
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
          <small>{ru}</small>
        </button>
      ))}
    </nav>
  );
}