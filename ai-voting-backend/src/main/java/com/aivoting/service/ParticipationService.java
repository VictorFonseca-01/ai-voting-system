package com.aivoting.service;

import com.aivoting.dto.ParticipationRequest;
import com.aivoting.entity.QuestionResponse;
import com.aivoting.entity.User;
import com.aivoting.entity.Vote;
import com.aivoting.repository.QuestionResponseRepository;
import com.aivoting.repository.UserRepository;
import com.aivoting.repository.VoteRepository;
import com.aivoting.util.ProfanityFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Serviço que processa a participação completa de um usuário anônimo.
 * Cria um registro de "Guest" e vincula votos e questionário.
 */
@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final QuestionResponseRepository questionResponseRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void submitParticipation(ParticipationRequest request) {
        // --- VALIDAÇÕES DE SEGURANÇA ---
        String name = request.getFullName() != null ? request.getFullName().trim() : "";
        
        // 1. Validação de Nome Completo (pelo menos dois nomes)
        if (!name.contains(" ") || name.split("\\s+").length < 2) {
            throw new RuntimeException("Por favor, digite seu nome completo (ex: Victor Fonseca)");
        }

        // 3. Filtro de Palavrões
        if (ProfanityFilter.containsProfanity(name)) {
            throw new RuntimeException("O nome contém termos inadequados.");
        }
        if (ProfanityFilter.containsProfanity(request.getCourse())) {
            throw new RuntimeException("O campo Curso contém termos inadequados.");
        }
        if (request.getInstitution() != null && ProfanityFilter.containsProfanity(request.getInstitution())) {
            throw new RuntimeException("O campo Instituição contém termos inadequados.");
        }

        // --- PROCESSAMENTO ---
        String guestEmail = "guest_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "@aivoting.guest";
        
        User guest = User.builder()
                .name(name)
                .email(guestEmail)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .course(request.getCourse())
                .institution(request.getInstitution() != null && !request.getInstitution().isBlank() ? request.getInstitution() : "N/A")
                .instagram(request.getInstagram())
                .role("ROLE_USER")
                .build();

        User savedUser = userRepository.save(guest);

        // 2. Salva os votos
        if (request.getAiNames() != null && request.getAiNames().size() == 2) {
            for (String aiName : request.getAiNames()) {
                Vote vote = Vote.builder()
                        .user(savedUser)
                        .aiName(aiName)
                        .build();
                voteRepository.save(vote);
            }
        }

        // 3. Salva a resposta do questionário
        QuestionResponse response = QuestionResponse.builder()
                .user(savedUser)
                .whereUseAi(request.getWhereUseAi())
                .whyUseAi(request.getWhyUseAi())
                .howUseAi(request.getHowUseAi())
                .useForStudy(request.getUseForStudy())
                .useForWork(request.getUseForWork())
                .workArea(request.getWorkArea())
                .workAreaOther(request.getWorkAreaOther())
                .answeredAt(LocalDateTime.now())
                .build();
        
        questionResponseRepository.save(response);
    }
}
