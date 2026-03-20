package com.aivoting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade que representa um voto de um usuário em uma IA.
 * Cada usuário pode votar em exatamente 2 IAs diferentes.
 */
@Entity
@Table(
    name = "votes",
    uniqueConstraints = {
        // Garante que cada usuário só pode votar 1x em cada IA
        @UniqueConstraint(columnNames = {"user_id", "ai_name"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nome da IA votada.
     * Valores possíveis: ChatGPT, Claude, Gemini, Grok, Meta AI, Copilot, Não utilizo IA
     */
    @Column(name = "ai_name", nullable = false)
    private String aiName;

    /** Usuário que realizou o voto */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Data e hora do voto */
    @Column(name = "voted_at")
    private LocalDateTime votedAt;

    @PrePersist
    protected void onCreate() {
        votedAt = LocalDateTime.now();
    }
}
