package com.aivoting.controller;

import com.aivoting.service.QuestionResponseService;
import com.aivoting.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller do dashboard de insights.
 * Endpoint público - não requer autenticação.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final VoteService voteService;
    private final QuestionResponseService questionResponseService;

    /**
     * GET /api/dashboard
     * Retorna todos os dados para o dashboard de insights.
     * Inclui: votos por IA, respostas do questionário, totais.
     */
    @GetMapping
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();

        // ─── Dados de votação ────────────────────────────────────
        dashboard.put("totalVotes", voteService.getTotalVotes());
        dashboard.put("votesByAi", voteService.getVoteCountByAi());

        // ─── Dados do questionário ───────────────────────────────
        Map<String, Object> questionData = questionResponseService.getDashboardData();
        dashboard.putAll(questionData);

        return ResponseEntity.ok(dashboard);
    }
}
