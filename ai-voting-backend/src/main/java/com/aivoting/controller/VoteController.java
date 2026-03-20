package com.aivoting.controller;

import com.aivoting.dto.VoteRequest;
import com.aivoting.entity.Vote;
import com.aivoting.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller de votação.
 * Todos os endpoints requerem autenticação JWT.
 */
@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    /**
     * POST /api/votes
     * Registra os 2 votos do usuário autenticado.
     * Body: { "aiNames": ["ChatGPT", "Claude"] }
     */
    @PostMapping
    public ResponseEntity<?> submitVotes(@Valid @RequestBody VoteRequest request) {
        try {
            List<Vote> votes = voteService.submitVotes(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Votos registrados com sucesso!",
                    "votes", votes.stream()
                            .map(v -> Map.of("id", v.getId(), "aiName", v.getAiName()))
                            .toList()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/votes/my
     * Retorna os votos do usuário autenticado.
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyVotes() {
        List<Vote> votes = voteService.getUserVotes();
        return ResponseEntity.ok(Map.of(
                "voted", !votes.isEmpty(),
                "votes", votes.stream()
                        .map(v -> Map.of("id", v.getId(), "aiName", v.getAiName()))
                        .toList()
        ));
    }

    /**
     * GET /api/votes/status
     * Verifica se o usuário já votou.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getVoteStatus() {
        return ResponseEntity.ok(Map.of("hasVoted", voteService.hasUserVoted()));
    }
}
