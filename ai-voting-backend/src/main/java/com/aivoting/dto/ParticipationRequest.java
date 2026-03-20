package com.aivoting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para submissão completa de participação (Votos + Perfil + Questionário).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipationRequest {
    
    // Lista de nomes das IAs (deve ter exatamente 2)
    private List<String> aiNames;

    // Dados de Identificação
    private String fullName;
    private String course;
    private String institution;
    private String instagram;

    // Respostas do Questionário
    private String whereUseAi;
    private String whyUseAi;
    private String howUseAi;
    private Boolean useForStudy;
    private Boolean useForWork;
    private String workArea;
    private String workAreaOther;
}
