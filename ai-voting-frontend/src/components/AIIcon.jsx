const emojiMap = {
  "chatgpt": "🤖",
  "claude": "🧠",
  "gemini": "✨",
  "grok": "⚡",
  "meta ai": "🔵",
  "meta": "🔵",
  "copilot": "🚀",
  "deepseek": "🔍",
};

export default function AIIcon({ name, size = 22 }) {
  if (!name) return null;

  const normalized = name.toLowerCase().trim();

  // Caso especial
  if (normalized.includes("não") || normalized.includes("nao")) {
    return <span style={{ fontSize: size }}>🚫</span>;
  }

  const emoji = emojiMap[normalized] || "🤖";

  return (
    <span 
      role="img" 
      aria-label={name}
      style={{ 
        fontSize: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1
      }}
    >
      {emoji}
    </span>
  );
}
