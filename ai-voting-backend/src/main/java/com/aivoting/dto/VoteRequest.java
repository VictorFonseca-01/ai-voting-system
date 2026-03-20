package com.aivoting.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para envio de votos do usuário.
 * O usuário deve votar em exatamente 2 IAs.
 */
@Data
public class VoteRequest {

    /**
     * Lista com exatamente 2 nomes de IAs.
     * Valores válidos: ChatGPT, Claude, Gemini, Grok, Meta AI, Copilot, Não utilizo IA
     */
    @NotNull(message = "Lista de votos é obrigatória")
    private List<String> aiNames;
}
