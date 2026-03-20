package com.aivoting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de resposta após login bem-sucedido.
 * Retorna o token JWT e informações básicas do usuário.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /** Token JWT para autenticação nas próximas requisições */
    private String token;

    /** Tipo do token (sempre "Bearer") */
    @Builder.Default
    private String type = "Bearer";

    /** ID do usuário */
    private Long userId;

    /** Nome do usuário */
    private String name;

    /** Email do usuário */
    private String email;

    /** Nível de Acesso (Ex: ROLE_ADMIN, ROLE_USER) */
    private String role;
}
