package com.aivoting.controller;

import com.aivoting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "",
                "hasVoted", user.getVotes() != null && !user.getVotes().isEmpty(),
                "hasAnswered", user.getQuestionResponses() != null && !user.getQuestionResponses().isEmpty()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }
}
