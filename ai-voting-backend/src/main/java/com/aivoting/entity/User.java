package com.aivoting.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidade que representa um usuário do sistema.
 * Armazena dados de autenticação e vincula votos e respostas.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nome completo do usuário */
    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false)
    private String name;

    /** Email único usado para login */
    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    @Column(nullable = false, unique = true)
    private String email;

    /** Senha criptografada com BCrypt */
    @NotBlank(message = "Senha é obrigatória")
    @Column(nullable = false)
    private String password;

    /** Data de criação da conta */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** Role do Usuário */
    @Column(nullable = false, columnDefinition = "varchar(255) default 'ROLE_USER'")
    @Builder.Default
    private String role = "ROLE_USER";

    /** Lista de votos do usuário (máx. 2) */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vote> votes;

    /** Respostas do questionário vinculadas ao usuário */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuestionResponse> questionResponses;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
