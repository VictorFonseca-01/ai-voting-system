package com.aivoting.controller;

import com.aivoting.service.QuestionResponseService;
import com.aivoting.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller do dashboard de insights.
 * Endpoint público - retorna dados básicos para todos, 
 * e dados detalhados apenas para admins.
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
     */
    @GetMapping
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();

        // ─── Dados gerais (Públicos) ──────────────────────────────
        dashboard.put("totalVotes", voteService.getTotalVotes());
        dashboard.put("votesByAi", voteService.getVoteCountByAi());

        Map<String, Object> questionData = questionResponseService.getDashboardData();
        dashboard.putAll(questionData);

        // ─── Dados detalhados (Apenas Admin) ─────────────────────
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            dashboard.put("recentVotes", voteService.getRecentVotesWithUser());
        }

        return ResponseEntity.ok(dashboard);
    }
}
