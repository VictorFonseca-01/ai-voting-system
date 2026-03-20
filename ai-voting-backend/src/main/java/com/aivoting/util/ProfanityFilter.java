package com.aivoting.util;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Filtro de palavras ofensivas para nomes de usuário.
 * Verifica contra uma lista de termos proibidos (PT-BR e EN).
 */
public final class ProfanityFilter {

    private ProfanityFilter() {}

    /**
     * Lista de termos proibidos (palavras ofensivas, palavrões, etc.).
     * A verificação é case-insensitive e busca os termos como substrings.
     */
    private static final List<String> BLOCKED_TERMS = List.of(
            // ─── Português ───────────────────────────────────────────
            "porra", "caralho", "merda", "foder", "fodase", "foda-se", "fodasse",
            "puta", "putaria", "arrombado", "arrombada", "cuzao", "cuzão",
            "viado", "viada", "viadinho", "bicha", "bichona",
            "buceta", "boceta", "piroca", "rola", "pau no cu",
            "vai tomar", "vai se fuder", "vsf", "fdp", "pqp", "tnc",
            "desgraça", "desgraçado", "desgraçada", "corno", "cornuda",
            "otario", "otário", "otaria", "otária", "babaca", "imbecil",
            "idiota", "retardado", "retardada", "mongoloide",
            "vagabundo", "vagabunda", "safado", "safada",
            "filho da puta", "filha da puta", "filhodaputa",
            "piranha", "galinha", "vaca", "bosta",
            "cu ", " cu", "cú", "anus",
            "punheta", "punheteiro", "broxa",
            "nojento", "nojenta", "lixo humano",
            "macaco", "macaca", "crioulo", "crioula",
            "nazist", "hitler", "fascist",
            // ─── Inglês ──────────────────────────────────────────────
            "fuck", "shit", "bitch", "asshole", "bastard",
            "dick", "pussy", "cunt", "whore", "slut",
            "nigger", "nigga", "faggot", "retard",
            "damn", "cock", "motherfucker", "wtf", "stfu"
    );

    /**
     * Padrão para nomes que contêm apenas caracteres especiais/números (sem letras reais).
     */
    private static final Pattern INVALID_NAME_PATTERN = Pattern.compile("^[^\\p{L}]+$");

    /**
     * Verifica se um nome contém termos ofensivos.
     * @param name Nome a ser verificado
     * @return true se contém conteúdo ofensivo
     */
    public static boolean containsProfanity(String name) {
        if (name == null || name.isBlank()) return false;

        String normalized = name.toLowerCase()
                .replaceAll("[áàâãä]", "a")
                .replaceAll("[éèêë]", "e")
                .replaceAll("[íìîï]", "i")
                .replaceAll("[óòôõö]", "o")
                .replaceAll("[úùûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z\\s]", ""); // remove números e especiais para comparação

        for (String term : BLOCKED_TERMS) {
            String normalizedTerm = term.toLowerCase()
                    .replaceAll("[áàâãä]", "a")
                    .replaceAll("[éèêë]", "e")
                    .replaceAll("[íìîï]", "i")
                    .replaceAll("[óòôõö]", "o")
                    .replaceAll("[úùûü]", "u")
                    .replaceAll("[ç]", "c")
                    .replaceAll("[^a-z\\s]", "");

            if (normalized.contains(normalizedTerm)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica se o nome é válido (tem letras, tamanho adequado, sem ofensas).
     * @param name Nome a ser validado
     * @return mensagem de erro ou null se válido
     */
    public static String validate(String name) {
        if (name == null || name.isBlank()) {
            return "O nome é obrigatório.";
        }

        String trimmed = name.trim();

        if (trimmed.length() < 2) {
            return "O nome deve ter pelo menos 2 caracteres.";
        }

        if (trimmed.length() > 50) {
            return "O nome deve ter no máximo 50 caracteres.";
        }

        if (INVALID_NAME_PATTERN.matcher(trimmed).matches()) {
            return "O nome deve conter pelo menos uma letra.";
        }

        if (containsProfanity(trimmed)) {
            return "O nome contém termos inadequados. Por favor, escolha outro nome.";
        }

        return null; // válido
    }
}
