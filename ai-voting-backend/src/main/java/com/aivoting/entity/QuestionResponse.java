package com.aivoting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade que armazena as respostas do questionário de um usuário.
 * Cada usuário tem uma única entrada com todas as suas respostas.
 */
@Entity
@Table(name = "question_responses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Usuário que respondeu o questionário */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ============================================
    // RESPOSTAS DAS PERGUNTAS
    // ============================================

    /** 1. Onde você mais usa IA? */
    @Column(name = "where_use_ai")
    private String whereUseAi;

    /** 2. Por que você usa IA? */
    @Column(name = "why_use_ai")
    private String whyUseAi;

    /** 3. Como você usa IA? */
    @Column(name = "how_use_ai")
    private String howUseAi;

    /** 4. Você usa IA para estudar? (true/false) */
    @Column(name = "use_for_study")
    private Boolean useForStudy;

    /** 5. Você usa IA para trabalho? (true/false) */
    @Column(name = "use_for_work")
    private Boolean useForWork;

    /**
     * 6. Com o que você trabalha?
     * Valores: Direito, Engenharia, TI, Mecânica, Administração, Outros
     */
    @Column(name = "work_area")
    private String workArea;

    /**
     * Campo adicional quando work_area = "Outros"
     * Permite o usuário descrever sua área de atuação
     */
    @Column(name = "work_area_other")
    private String workAreaOther;

    /** Data de envio das respostas */
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @PrePersist
    protected void onCreate() {
        answeredAt = LocalDateTime.now();
    }
}
