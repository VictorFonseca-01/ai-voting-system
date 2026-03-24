/**
 * Security Engine - Elite 4.5 🛡️
 * Gestão de Identidade Técnica (Anti-Fraude)
 */

/**
 * Gera um Fingerprint leve do navegador baseado em atributos de hardware.
 */
export const getFingerprint = () => {
    let renderer = 'unknown';
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
        renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    } catch (e) {
        // Ignora erros de silêncio se o canvas estiver bloqueado
    }

    const components = [
        navigator.userAgent,
        navigator.language,
        window.screen.width + 'x' + window.screen.height,
        window.screen.colorDepth,
        new Date().getTimezoneOffset(),
        renderer,
        navigator.hardwareConcurrency || 'N/A',
        navigator.deviceMemory || 'N/A'
    ];
    
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'fp_' + Math.abs(hash).toString(36);
};

/**
 * Recupera ou cria um Session ID persistente no LocalStorage.
 */
export const getPersistentSessionId = () => {
    let sid = localStorage.getItem('aivote_sid');
    if (!sid) {
        if (window.crypto && window.crypto.randomUUID) {
            sid = 'sid_' + window.crypto.randomUUID().replace(/-/g, '');
        } else {
            sid = 'sid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
        localStorage.setItem('aivote_sid', sid);
    }
    return sid;
};

/**
 * Marca o dispositivo local como "Votado".
 */
export const markAsVotedLocally = () => {
    localStorage.setItem('aivote_has_voted', 'true');
    localStorage.setItem('aivote_voted_at', new Date().toISOString());
};

/**
 * Verifica se o dispositivo tem o marcador local.
 */
export const checkLocalVoteStatus = () => {
    return localStorage.getItem('aivote_has_voted') === 'true';
};
