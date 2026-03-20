package com.aivoting.service;

import com.aivoting.dto.QuestionResponseRequest;
import com.aivoting.entity.QuestionResponse;
import com.aivoting.entity.User;
import com.aivoting.repository.QuestionResponseRepository;
import com.aivoting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Serviço para gerenciar respostas do questionário.
 */
@Service
@RequiredArgsConstructor
public class QuestionResponseService {

    private final QuestionResponseRepository questionResponseRepository;
    private final UserRepository userRepository;

    /**
     * Salva ou atualiza as respostas do questionário do usuário autenticado.
     */
    @Transactional
    public QuestionResponse submitResponse(QuestionResponseRequest request) {
        User user = getAuthenticatedUser();

        // Verifica se o usuário já respondeu (atualiza se sim)
        QuestionResponse response = questionResponseRepository
                .findByUserId(user.getId())
                .orElse(QuestionResponse.builder().user(user).build());

        // Atualiza os campos com as respostas fornecidas
        response.setWhereUseAi(request.getWhereUseAi());
        response.setWhyUseAi(request.getWhyUseAi());
        response.setHowUseAi(request.getHowUseAi());
        response.setUseForStudy(request.getUseForStudy());
        response.setUseForWork(request.getUseForWork());
        response.setWorkArea(request.getWorkArea());
        response.setWorkAreaOther(request.getWorkAreaOther());

        return questionResponseRepository.save(response);
    }

    /**
     * Verifica se o usuário já respondeu o questionário.
     */
    public boolean hasUserAnswered() {
        User user = getAuthenticatedUser();
        return questionResponseRepository.existsByUserId(user.getId());
    }

    /**
     * Retorna respostas do usuário autenticado.
     */
    public QuestionResponse getUserResponse() {
        User user = getAuthenticatedUser();
        return questionResponseRepository.findByUserId(user.getId())
                .orElse(null);
    }

    // ─── DADOS PARA O DASHBOARD ──────────────────────────────────────────────

    /**
     * Retorna todos os dados agregados para o dashboard.
     */
    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new LinkedHashMap<>();

        // Total de respondentes
        data.put("totalResponses", questionResponseRepository.countTotalResponses());

        // Uso para estudo
        data.put("useForStudy", questionResponseRepository.countUseForStudy());

        // Uso para trabalho
        data.put("useForWork", questionResponseRepository.countUseForWork());

        // Onde usam IA
        data.put("whereUseAi", toMap(questionResponseRepository.countByWhereUseAi()));

        // Por que usam IA
        data.put("whyUseAi", toMap(questionResponseRepository.countByWhyUseAi()));

        // Como usam IA
        data.put("howUseAi", toMap(questionResponseRepository.countByHowUseAi()));

        // Áreas profissionais
        data.put("workAreas", toMap(questionResponseRepository.countByWorkArea()));

        return data;
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

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
