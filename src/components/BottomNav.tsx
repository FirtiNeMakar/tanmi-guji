import { Compass, House, Layers3, LibraryBig, Stamp } from "lucide-react";
import type { TabId } from "../types";
import { translate } from "../i18n";
import type { Language } from "../i18n";

type Props = { active: TabId; onChange: (tab: TabId) => void; language: Language };

const items: { id: TabId; label: string; ru: string; icon: typeof House }[] = [
  { id: "home", label: "首页", ru: "Главная", icon: House },
  { id: "dig", label: "云探方", ru: "Раскоп", icon: Layers3 },
  { id: "restore", label: "文物修复", ru: "Реставрация", icon: Compass },
  { id: "passport", label: "研学护照", ru: "Паспорт", icon: Stamp },
  { id: "discover", label: "博古通今", ru: "Знания", icon: LibraryBig },
];

export default function BottomNav({ active, onChange, language }: Props) {
  return (
    <nav className="bottom-nav" aria-label={translate("主导航", language)}>
      {items.map(({ id, label, ru, icon: Icon }) => (
        <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => onChange(id)}>
          <Icon size={20} strokeWidth={1.8} />
          <span>{language === "ru" ? ru : translate(label, language)}</span>

        </button>
      ))}
    </nav>
  );
}