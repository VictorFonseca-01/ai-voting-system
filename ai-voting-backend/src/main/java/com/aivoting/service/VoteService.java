package com.aivoting.service;

import com.aivoting.dto.VoteRequest;
import com.aivoting.entity.User;
import com.aivoting.entity.Vote;
import com.aivoting.repository.UserRepository;
import com.aivoting.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Serviço de votação. Gerencia as regras de negócio dos votos.
 * Regras: exatamente 2 votos por usuário, sem duplicatas.
 */
@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    /** IAs disponíveis para votação */
    private static final List<String> VALID_AI_NAMES = List.of(
            "ChatGPT", "Claude", "Gemini", "Grok",
            "Meta AI", "Copilot", "DeepSeek", "Não utilizo IA / Outra"
    );

    /**
     * Registra os 2 votos do usuário autenticado.
     * @param request Lista com exatamente 2 nomes de IAs
     * @return Lista de votos registrados
     */
    @Transactional
    public List<Vote> submitVotes(VoteRequest request) {
        User user = getAuthenticatedUser();

        List<String> aiNames = request.getAiNames();

        // ─── VALIDAÇÕES ──────────────────────────────────────────────────────

        // Deve votar em exatamente 2 IAs
        if (aiNames == null || aiNames.size() != 2) {
            throw new RuntimeException("Você deve votar em exatamente 2 IAs.");
        }

        // Não pode votar na mesma IA duas vezes
        if (aiNames.get(0).equals(aiNames.get(1))) {
            throw new RuntimeException("Você não pode votar na mesma IA duas vezes.");
        }

        // Valida se os nomes das IAs são válidos
        for (String aiName : aiNames) {
            if (!VALID_AI_NAMES.contains(aiName)) {
                throw new RuntimeException("IA inválida: " + aiName);
            }
        }

        // Remove votos anteriores se existirem (permitir revisão)
        List<Vote> existingVotes = voteRepository.findByUserId(user.getId());
        if (!existingVotes.isEmpty()) {
            voteRepository.deleteAll(existingVotes);
        }

        // ─── SALVA OS VOTOS ──────────────────────────────────────────────────

        List<Vote> votes = new ArrayList<>();
        for (String aiName : aiNames) {
            Vote vote = Vote.builder()
                    .user(user)
                    .aiName(aiName)
                    .build();
            votes.add(voteRepository.save(vote));
        }

        return votes;
    }

    /**
     * Retorna os votos do usuário autenticado.
     */
    public List<Vote> getUserVotes() {
        User user = getAuthenticatedUser();
        return voteRepository.findByUserId(user.getId());
    }

    /**
     * Verifica se o usuário autenticado já votou.
     */
    public boolean hasUserVoted() {
        User user = getAuthenticatedUser();
        return voteRepository.countByUserId(user.getId()) > 0;
    }

    /**
     * Retorna contagem de votos por IA (para o dashboard).
     * Formato: { "ChatGPT": 45, "Claude": 32, ... }
     */
    public Map<String, Long> getVoteCountByAi() {
        List<Object[]> results = voteRepository.countVotesByAi();
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    /**
     * Total de votos no sistema.
     */
    public long getTotalVotes() {
        return voteRepository.countTotalVotes();
    }

    /**
     * Retorna lista de votos com os nomes dos usuários (Apenas para fins administrativos).
     */
    public List<Map<String, Object>> getRecentVotesWithUser() {
        return voteRepository.findAllWithUser().stream()
                .map(vote -> Map.<String, Object>of(
                        "userName", vote.getUser().getName(),
                        "userEmail", vote.getUser().getEmail(),
                        "aiName", vote.getAiName()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Obtém o usuário autenticado via SecurityContext.
     */
    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
