package com.aivoting.controller;

import com.aivoting.config.DataInitializer;
import com.aivoting.repository.QuestionResponseRepository;
import com.aivoting.repository.UserRepository;
import com.aivoting.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.aivoting.entity.User;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller restrito para Administradores.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final QuestionResponseRepository questionResponseRepository;
    private final DataInitializer dataInitializer;

    /**
     * GET /api/admin/users
     * Lista todos os usuários cadastrados e seus respectivos status.
     */
    @GetMapping("/users")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listRegisteredUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream().map(user -> Map.<String, Object>of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "course", user.getCourse() != null ? user.getCourse() : "",
                "institution", user.getInstitution() != null ? user.getInstitution() : "",
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "",
                "hasVoted", user.getVotes() != null && !user.getVotes().isEmpty(),
                "hasAnswered", user.getQuestionResponses() != null && !user.getQuestionResponses().isEmpty()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Exclui um usuário específico e todos os seus dados vinculados.
     */
    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            // Se for o admin principal, não permite excluir a si mesmo por segurança
            if ("admin@aivoting.com".equals(user.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "O administrador principal não pode ser excluído."));
            }

            // Remove referências
            questionResponseRepository.deleteByUser(user);
            voteRepository.deleteByUser(user);
            userRepository.delete(user);

            return ResponseEntity.ok(Map.of("message", "Usuário " + user.getName() + " excluído com sucesso."));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/admin/reset
     * Limpa TODOS os dados do sistema e recria o admin padrão.
     * Apenas admins autenticados podem acessar.
     */
    @DeleteMapping("/reset")
    @Transactional
    public ResponseEntity<?> resetAllData() {
        questionResponseRepository.deleteAll();
        voteRepository.deleteAll();
        userRepository.deleteAll();

        // Recria o admin padrão automaticamente
        dataInitializer.createAdminIfNotExists();

        return ResponseEntity.ok(Map.of(
            "message", "Dados apagados e admin recriado com sucesso.",
            "adminEmail", "admin@aivoting.com",
            "adminPassword", "Admin@2026"
        ));
    }
}
