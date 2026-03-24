import React from 'react';
import chatgpt from '../assets/icons/ai/chatgpt.svg';
import claude from '../assets/icons/ai/claude.svg';
import gemini from '../assets/icons/ai/gemini.svg';
import grok from '../assets/icons/ai/grok.svg';
import meta from '../assets/icons/ai/meta.svg';
import copilot from '../assets/icons/ai/copilot.svg';
import deepseek from '../assets/icons/ai/deepseek.svg';

const iconMap = {
  chatgpt,
  claude,
  gemini,
  grok,
  meta,
  copilot,
  deepseek,
};

/**
 * Componente AIIcon - Elite AI Icon System
 * Mapeia nomes de IA para SVGs profissionais ou emojis de fallback.
 */
export default function AIIcon({ name, size = 22, style = {} }) {
  if (!name) return null;

  const key = name.toLowerCase().trim();

  // Caso especial: Não utiliza IA (Mantém Emoji conforme regra)
  if (key.includes("não") || key.includes("nao")) {
    return <span style={{ fontSize: size, ...style }}>🚫</span>;
  }

  // Tenta encontrar correspondência exata ou parcial (ex: "ChatGPT Plus" -> chatgpt)
  const icon = iconMap[key] || Object.entries(iconMap).find(([k]) => key.includes(k))?.[1];

  if (!icon) {
    return <span style={{ fontSize: size, ...style }}>🤖</span>;
  }

  return (
    <img
      src={icon}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      style={{
        objectFit: "contain",
        display: "block",
        ...style
      }}
    />
  );
}
