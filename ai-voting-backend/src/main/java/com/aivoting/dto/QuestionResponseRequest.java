package com.aivoting.dto;

import lombok.Data;

/**
 * DTO para envio das respostas do questionário.
 */
@Data
public class QuestionResponseRequest {

    /** 1. Onde você mais usa IA? */
    private String whereUseAi;

    /** 2. Por que você usa IA? */
    private String whyUseAi;

    /** 3. Como você usa IA? */
    private String howUseAi;

    /** 4. Você usa IA para estudar? */
    private Boolean useForStudy;

    /** 5. Você usa IA para trabalho? */
    private Boolean useForWork;

    /**
     * 6. Com o que você trabalha?
     * Valores: Direito, Engenharia, TI, Mecânica, Administração, Outros
     */
    private String workArea;

    /** Descrição quando workArea = "Outros" */
    private String workAreaOther;
}
