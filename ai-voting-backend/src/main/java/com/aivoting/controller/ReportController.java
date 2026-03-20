package com.aivoting.controller;

import com.aivoting.entity.QuestionResponse;
import com.aivoting.entity.Vote;
import com.aivoting.repository.QuestionResponseRepository;
import com.aivoting.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller responsável pela geração dos relatórios para impressão.
 * Restrito para Administradores via WebSecurityConfig.
 */
@RestController
@RequestMapping("/api/admin/report")
@RequiredArgsConstructor
public class ReportController {

    private final VoteRepository voteRepository;
    private final QuestionResponseRepository questionResponseRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> generateReport() {
        List<Vote> allVotes = voteRepository.findAll();
        List<QuestionResponse> allResponses = questionResponseRepository.findAll();

        long totalUsersVoted = allVotes.stream().map(v -> v.getUser().getId()).distinct().count();

        // Agrupa votos por IA
        Map<String, List<Vote>> votesByAi = allVotes.stream()
                .collect(Collectors.groupingBy(Vote::getAiName));

        // Constrói os dados do relatório por IA
        List<Map<String, Object>> aiReports = new ArrayList<>();

        for (Map.Entry<String, List<Vote>> entry : votesByAi.entrySet()) {
            String aiName = entry.getKey();
            List<Vote> aiVotes = entry.getValue();

            // Pega os usuários que votaram nessa IA
            Set<Long> userIds = aiVotes.stream()
                    .map(v -> v.getUser().getId())
                    .collect(Collectors.toSet());

            // Filtra as respostas do questionário só para a galera que votou nessa IA
            List<QuestionResponse> responsesForThisAi = allResponses.stream()
                    .filter(qr -> userIds.contains(qr.getUser().getId()))
                    .collect(Collectors.toList());

            // 1) As 2 principais áreas de atuação de quem votou nessa IA
            Map<String, Long> workAreaCounts = responsesForThisAi.stream()
                    .collect(Collectors.groupingBy(QuestionResponse::getWorkArea, Collectors.counting()));
            
            List<Map.Entry<String, Long>> topWorkAreas = workAreaCounts.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(2)
                    .collect(Collectors.toList());

            // 2) Os 2 principais "por que usa" de quem votou nessa IA
            Map<String, Long> whyUseCounts = new HashMap<>();
            for (QuestionResponse r : responsesForThisAi) {
                if (r.getWhyUseAi() != null && !r.getWhyUseAi().isBlank()) {
                    String[] reasons = r.getWhyUseAi().split(",");
                    for (String reason : reasons) {
                        String cleanReason = reason.trim();
                        if (!cleanReason.isEmpty()) {
                            whyUseCounts.put(cleanReason, whyUseCounts.getOrDefault(cleanReason, 0L) + 1);
                        }
                    }
                }
            }
            List<Map.Entry<String, Long>> topReasons = whyUseCounts.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(2)
                    .collect(Collectors.toList());

            // 3) Lista de usuários (Nome, Curso, Faculdade/Empresa)
            List<Map<String, String>> usersList = aiVotes.stream()
                    .map(v -> {
                        Map<String, String> userMap = new HashMap<>();
                        userMap.put("name", v.getUser().getName());
                        userMap.put("course", v.getUser().getCourse() != null ? v.getUser().getCourse() : "N/A");
                        userMap.put("institution", v.getUser().getInstitution() != null ? v.getUser().getInstitution() : "N/A");
                        return userMap;
                    })
                    // ordena por nome
                    .sorted(Comparator.comparing(u -> u.get("name")))
                    .collect(Collectors.toList());

            aiReports.add(Map.of(
                    "aiName", aiName,
                    "totalVotes", aiVotes.size(),
                    "users", usersList,
                    "topWorkAreas", topWorkAreas.stream().map(e -> e.getKey() + " (" + e.getValue() + ")").collect(Collectors.toList()),
                    "topReasons", topReasons.stream().map(e -> e.getKey() + " (" + e.getValue() + ")").collect(Collectors.toList())
            ));
        }

        // Ordena por quantidade de votos decrescente
        aiReports.sort((a, b) -> Integer.compare((Integer) b.get("totalVotes"), (Integer) a.get("totalVotes")));

        Map<String, Object> result = new HashMap<>();
        result.put("totalUsersVoted", totalUsersVoted);
        result.put("aiReports", aiReports);

        return ResponseEntity.ok(result);
    }
}
