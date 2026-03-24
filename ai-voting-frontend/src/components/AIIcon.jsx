import chatgpt from "../assets/icons/ai/chatgpt.svg";
import claude from "../assets/icons/ai/claude.svg";
import gemini from "../assets/icons/ai/gemini.svg";
import grok from "../assets/icons/ai/grok.svg";
import meta from "../assets/icons/ai/meta.svg";
import copilot from "../assets/icons/ai/copilot.svg";
import deepseek from "../assets/icons/ai/deepseek.svg";

const iconMap = {
  "chatgpt": chatgpt,
  "claude": claude,
  "gemini": gemini,
  "grok": grok,
  "meta ai": meta,
  "meta": meta,
  "copilot": copilot,
  "deepseek": deepseek,
};

export default function AIIcon({ name, size = 22 }) {
  if (!name) return null;

  const normalized = name.toLowerCase().trim();

  // Caso especial
  if (normalized.includes("não") || normalized.includes("nao")) {
    return <span style={{ fontSize: size }}>🚫</span>;
  }

  const icon = iconMap[normalized];

  // Fallback seguro (NUNCA usar ícone errado)
  if (!icon) {
    return <span style={{ fontSize: size }}>🤖</span>;
  }

  return (
    <img
      src={icon}
      alt={name}
      width={size}
      height={size}
      style={{
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}
