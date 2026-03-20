package com.aivoting.service;

import com.aivoting.entity.QuestionResponse;
import com.aivoting.repository.QuestionResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço para gerenciar respostas do questionário.
 */
@Service
@RequiredArgsConstructor
public class QuestionResponseService {

    private final QuestionResponseRepository questionResponseRepository;

    /**
     * Retorna todas as respostas para exportação/lista admin.
     */
    public List<QuestionResponse> getAllResponses() {
        return questionResponseRepository.findAll();
    }

    // ─── DADOS PARA O DASHBOARD ──────────────────────────────────────────────

    /**
     * Retorna todos os dados agregados para o dashboard.
     */
    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new LinkedHashMap<>();

        List<QuestionResponse> allResponses = questionResponseRepository.findAll();

        // Total de respondentes
        data.put("totalResponses", (long) allResponses.size());

        // Uso para estudo
        data.put("useForStudy", allResponses.stream().filter(r -> r.getUseForStudy() != null && r.getUseForStudy()).count());

        // Uso para trabalho
        data.put("useForWork", allResponses.stream().filter(r -> r.getUseForWork() != null && r.getUseForWork()).count());

        // Onde usam IA (Multi-select)
        data.put("whereUseAi", aggregateField(allResponses, QuestionResponse::getWhereUseAi));

        // Por que usam IA (Multi-select)
        data.put("whyUseAi", aggregateField(allResponses, QuestionResponse::getWhyUseAi));

        // Como usam IA (Multi-select)
        data.put("howUseAi", aggregateField(allResponses, QuestionResponse::getHowUseAi));

        // Áreas profissionais (Single select)
        data.put("workAreas", toMap(questionResponseRepository.countByWorkArea()));

        return data;
    }

    /**
     * Agrega campos que podem conter múltiplos valores separados por vírgula.
     */
    private Map<String, Long> aggregateField(List<QuestionResponse> responses, java.util.function.Function<QuestionResponse, String> extractor) {
        Map<String, Long> counts = new HashMap<>();
        for (QuestionResponse r : responses) {
            String value = extractor.apply(r);
            if (value != null && !value.isBlank()) {
                String[] parts = value.split(",");
                for (String part : parts) {
                    String clean = part.trim();
                    if (!clean.isEmpty()) {
                        counts.put(clean, counts.getOrDefault(clean, 0L) + 1);
                    }
                }
            }
        }
        // Ordena por contagem decrescente
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    /**
     * Converte lista de Object[] [label, count] em Map<String, Long>.
     */
    private Map<String, Long> toMap(List<Object[]> rows) {
        return rows.stream()
                .filter(row -> row[0] != null)
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

}
