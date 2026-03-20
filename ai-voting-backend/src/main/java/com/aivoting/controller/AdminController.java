package com.aivoting.controller;

import com.aivoting.config.DataInitializer;
import com.aivoting.repository.QuestionResponseRepository;
import com.aivoting.repository.UserRepository;
import com.aivoting.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
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
    private final PasswordEncoder passwordEncoder;

    /**
     * PUT /api/admin/password
     * Altera a senha do administrador logado.
     */
    @PutMapping("/password")
    @Transactional
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "A senha deve ter pelo menos 6 caracteres."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).map(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso."));
        }).orElse(ResponseEntity.status(401).build());
    }

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
                "instagram", user.getInstagram() != null ? user.getInstagram() : "",
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
     * DELETE /api/admin/my-votes
     * Remove apenas os votos do administrador logado para fins de teste.
     */
    @DeleteMapping("/my-votes")
    @Transactional
    public ResponseEntity<?> resetMyAdminVotes() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).map(user -> {
            voteRepository.deleteByUser(user);
            return ResponseEntity.ok(Map.of("message", "Seus votos foram removidos. Você pode votar novamente."));
        }).orElse(ResponseEntity.status(401).build());
    }

    /**
     * GET /api/admin/export
     * Exporta todos os dados do sistema em formato JSON simplificado para backup.
     */
    @GetMapping("/export")
    @Transactional(readOnly = true)
    public ResponseEntity<?> exportData() {
        Map<String, Object> backup = new LinkedHashMap<>();
        
        // Exporta usuários
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", u.getName());
                    map.put("email", u.getEmail());
                    map.put("password", u.getPassword());
                    map.put("course", u.getCourse());
                    map.put("institution", u.getInstitution());
                    map.put("instagram", u.getInstagram());
                    map.put("role", u.getRole());
                    return map;
                }).collect(Collectors.toList());
        backup.put("users", users);

        // Exporta votos
        List<Map<String, Object>> votes = voteRepository.findAll().stream()
                .map(v -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userEmail", v.getUser().getEmail());
                    map.put("aiName", v.getAiName());
                    return map;
                }).collect(Collectors.toList());
        backup.put("votes", votes);

        // Exporta respostas
        List<Map<String, Object>> responses = questionResponseRepository.findAll().stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userEmail", r.getUser().getEmail());
                    map.put("workArea", r.getWorkArea()); // Corrected field
                    map.put("whereUseAi", r.getWhereUseAi());
                    map.put("whyUseAi", r.getWhyUseAi());
                    // Novas perguntas
                    map.put("howUseAi", r.getHowUseAi());
                    map.put("useForStudy", r.getUseForStudy());
                    map.put("useForWork", r.getUseForWork());
                    map.put("workAreaOther", r.getWorkAreaOther());
                    return map;
                }).collect(Collectors.toList());
        backup.put("responses", responses);

        return ResponseEntity.ok(backup);
    }

    /**
     * POST /api/admin/import
     * Importa dados de um JSON de backup, substituindo os dados atuais.
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/import")
    @Transactional
    public ResponseEntity<?> importData(@RequestBody Map<String, Object> backup) {
        try {
            // 1. Limpa o banco atual
            questionResponseRepository.deleteAll();
            voteRepository.deleteAll();
            userRepository.deleteAll();

            // 2. Recria Admin Master
            dataInitializer.createAdminIfNotExists();

            // 3. Importa Usuários
            List<Map<String, Object>> usersData = (List<Map<String, Object>>) backup.get("users");
            Map<String, com.aivoting.entity.User> emailToUser = new HashMap<>();
            
            for (Map<String, Object> uMap : usersData) {
                String email = (String) uMap.get("email");
                if ("admin@aivoting.com".equals(email)) continue; // Pula admin já criado

                com.aivoting.entity.User user = com.aivoting.entity.User.builder()
                        .name((String) uMap.get("name"))
                        .email(email)
                        .password((String) uMap.get("password"))
                        .course((String) uMap.get("course"))
                        .institution((String) uMap.get("institution"))
                        .instagram((String) uMap.get("instagram"))
                        .role((String) uMap.get("role"))
                        .build();
                
                com.aivoting.entity.User saved = userRepository.save(user);
                emailToUser.put(email, saved);
            }

            // Adiciona o admin na lista de mapeamento
            userRepository.findByEmail("admin@aivoting.com").ifPresent(adm -> emailToUser.put(adm.getEmail(), adm));

            // 4. Importa Votos
            List<Map<String, Object>> votesData = (List<Map<String, Object>>) backup.get("votes");
            if (votesData != null) {
                for (Map<String, Object> vMap : votesData) {
                    String userEmail = (String) vMap.get("userEmail");
                    com.aivoting.entity.User user = emailToUser.get(userEmail);
                    if (user != null) {
                        voteRepository.save(com.aivoting.entity.Vote.builder()
                                .user(user)
                                .aiName((String) vMap.get("aiName"))
                                .build());
                    }
                }
            }

            // 5. Importa Respostas
            List<Map<String, Object>> respData = (List<Map<String, Object>>) backup.get("responses");
            if (respData != null) {
                for (Map<String, Object> rMap : respData) {
                    String userEmail = (String) rMap.get("userEmail");
                    com.aivoting.entity.User user = emailToUser.get(userEmail);
                    if (user != null) {
                        questionResponseRepository.save(com.aivoting.entity.QuestionResponse.builder()
                                .user(user)
                                .workArea((String) rMap.get("workArea"))
                                .whereUseAi((String) rMap.get("whereUseAi"))
                                .whyUseAi((String) rMap.get("whyUseAi"))
                                .howUseAi((String) rMap.get("howUseAi"))
                                .useForStudy(rMap.get("useForStudy") != null ? (Boolean) rMap.get("useForStudy") : false)
                                .useForWork(rMap.get("useForWork") != null ? (Boolean) rMap.get("useForWork") : false)
                                .workAreaOther((String) rMap.get("workAreaOther"))
                                .build());
                    }
                }
            }

            return ResponseEntity.ok(Map.of("message", "Backup restaurado com sucesso!", "usersImported", usersData.size()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erro na restauração: " + e.getMessage()));
        }
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
