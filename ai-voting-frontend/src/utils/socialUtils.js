/**
 * utilitários para normalização e validação de redes sociais
 */

/**
 * Extrai o username de uma entrada do Instagram (handle, URL, etc)
 */
export const extractInstagramUsername = (input) => {
  if (!input || typeof input !== 'string') return null;

  let clean = input.trim().toLowerCase();
  
  // Remove protocolos e domínios
  clean = clean.replace(/https?:\/\//g, '');
  clean = clean.replace(/http?:\/\//g, '');
  clean = clean.replace(/www\./g, '');
  clean = clean.replace(/instagram\.com\//g, '');
  clean = clean.replace(/instagr\.am\//g, '');
  
  // Remove o @ se existir em qualquer posição
  clean = clean.replace(/@/g, '');
  
  // Remove qualquer caractere que não seja letra, número, ponto ou underscore
  // Isso atende ao pedido de "filtrar símbolos inválidos"
  clean = clean.replace(/[^a-z0-9._]/g, '');

  // Remove barras finais ou parâmetros de query
  clean = clean.split('/')[0].split('?')[0];

  return clean || null;
};

/**
 * Valida o formato de um username do Instagram
 * Regras: letras, números, pontos e underscores. Máximo 30 caracteres.
 */
export const isValidInstagramFormat = (username) => {
  if (!username) return false;
  
  // Regex: apenas caracteres permitidos, sem espaços, sem caracteres especiais exceto . e _
  const igRegex = /^[a-zA-Z0-9._]{1,30}$/;
  
  if (!igRegex.test(username)) return false;

  // Instagram não permite pontos seguidos (..) ou ponto no final do nome
  if (username.includes('..') || username.endsWith('.')) return false;

  return true;
};

/**
 * Retorna a URL completa do Instagram
 */
export const getInstagramUrl = (username) => {
  if (!username) return null;
  return `https://www.instagram.com/${username}/`;
};

/**
 * Tenta validar se o perfil existe (Best Effort via no-cors fetch se estiver no browser)
 * NOTA: Devido a CORS e políticas de segurança, essa validação pode ser limitada.
 */
export const validateInstagramExistence = async (username) => {
    if (!username || !isValidInstagramFormat(username)) return false;
    
    try {
        // Tentativa de HEAD request (muitos navegadores bloqueiam por CORS)
        // Se falhar, dependemos apenas do formato para não quebrar a UX
        const url = getInstagramUrl(username);
        const res = await fetch(url, { mode: 'no-cors' });
        
        // no-cors sempre retorna type: "opaque" e status: 0, 
        // então não conseguimos saber se é 404.
        // Portanto, para a versão React puro sem Proxy, usamos apenas validação de formato.
        return true; 
    } catch (e) {
        return false;
    }
};
