import { useState } from "react"
import { devDataset, setDevDataset } from "./dataset"
import type { DevDataset } from "./fixtures"

const OPTIONS: { value: DevDataset | null; label: string }[] = [
  { value: null, label: "API" },
  { value: "demo", label: "Démo" },
  { value: "worst", label: "Pire cas" },
  { value: "empty", label: "Vide" },
  { value: "one", label: "Un seul" },
]

/** Sélecteur de jeu de données, en développement uniquement (break-ui). */
export function DataToggle() {
  const [current] = useState(devDataset)
  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2147483647,
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: "#e5e5e5",
        boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        font: "12px system-ui, sans-serif",
      }}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => setDevDataset(o.value)}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "5px 11px",
            cursor: "pointer",
            background: current === o.value ? "#fff" : "transparent",
            color: "#222",
            fontWeight: current === o.value ? 600 : 400,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
