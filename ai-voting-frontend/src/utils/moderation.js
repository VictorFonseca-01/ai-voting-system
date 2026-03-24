/** 
 * TextNormalizer & Moderation Engine - JS Port (Safe Mode)
 * Migrado do Backend Java para manter a segurança no ecossistema Supabase.
 */

export const BLACKLIST = [
  // Termos ofensivos (Mesma lista do backend Java)
  'porra','caralho','merda','foder','fodase','foda-se','fodasse',
  'puta','putaria','arrombado','arrombada','cuzao','cuzão',
  'viado','viada','viadinho','bicha','bichona',
  'buceta','boceta','piroca','rola',
  'vsf','fdp','pqp','tnc',
  'desgraçado','desgraçada','corno','cornuda',
  'otario','otário','otaria','otária','babaca','imbecil',
  'idiota','retardado','retardada','mongoloide',
  'vagabundo','vagabunda','safado','safada',
  'filhodaputa','piranha','bosta',
  'punheta','punheteiro','broxa',
  'macaco','macaca','crioulo','crioula',
  'nazist','hitler','fascist',
  'fuck','shit','bitch','asshole','bastard',
  'dick','pussy','cunt','whore','slut',
  'nigger','nigga','faggot','retard',
  'cock','motherfucker','wtf','stfu'
];

/** 
 * Normaliza o texto removendo acentos e caracteres especiais para checagem robusta.
 */
export const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s]/g, "");    // Remove caracteres especiais
};

/** 
 * Verifica se o texto contém algum termo proibido.
 */
export const hasInappropriateContent = (text) => {
  if (!text) return false;
  const normalized = normalizeText(text);
  
  // Verifica se o termo exato existe como palavra isolada
  return BLACKLIST.some(term => {
    const normTerm = normalizeText(term);
    const regex = new RegExp(`\\b${normTerm}\\b`, 'i');
    return regex.test(normalized);
  });
};

/** 
 * Validador para campos de formulário.
 */
export const validateField = (name, value) => {
  if (!value) return null;
  if (value.length < 2) return `O campo ${name} está muito curto.`;
  if (hasInappropriateContent(value)) return `Conteúdo inadequado detectado em ${name}.`;
  return null;
};
