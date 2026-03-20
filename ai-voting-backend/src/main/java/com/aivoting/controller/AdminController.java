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
import java.util.UUID;
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
                    map.put("answeredAt", r.getAnsweredAt() != null ? r.getAnsweredAt().toString() : null);
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
                if (email == null) continue;
                String lowerEmail = email.toLowerCase().trim();
                
                if ("admin@aivoting.com".equals(lowerEmail)) continue;

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
                emailToUser.put(lowerEmail, saved);
            }

            // Adiciona o admin na lista de mapeamento (lowercase)
            userRepository.findByEmail("admin@aivoting.com").ifPresent(adm -> emailToUser.put(adm.getEmail().toLowerCase(), adm));

            // 4. Importa Votos
            List<Map<String, Object>> votesData = (List<Map<String, Object>>) backup.get("votes");
            if (votesData != null) {
                for (Map<String, Object> vMap : votesData) {
                    String userEmail = (String) vMap.get("userEmail");
                    if (userEmail == null) continue;
                    com.aivoting.entity.User user = emailToUser.get(userEmail.toLowerCase().trim());
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
                    if (userEmail == null) continue;
                    com.aivoting.entity.User user = emailToUser.get(userEmail.toLowerCase().trim());
                    if (user != null) {
                        questionResponseRepository.save(com.aivoting.entity.QuestionResponse.builder()
                                .user(user)
                                .workArea((String) rMap.get("workArea"))
                                .whereUseAi((String) rMap.get("whereUseAi"))
                                .whyUseAi((String) rMap.get("whyUseAi"))
                                .howUseAi((String) rMap.get("howUseAi"))
                                .useForStudy(toBoolean(rMap.get("useForStudy")))
                                .useForWork(toBoolean(rMap.get("useForWork")))
                                .workAreaOther((String) rMap.get("workAreaOther"))
                                .answeredAt(rMap.get("answeredAt") != null ? java.time.LocalDateTime.parse((String) rMap.get("answeredAt")) : java.time.LocalDateTime.now())
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
     * POST /api/admin/fix-stats
     * Adiciona 5 registros de recuperação para corrigir as estatísticas de Estudo/Trabalho.
     */
    @PostMapping("/fix-stats")
    @Transactional
    public ResponseEntity<?> fixStats() {
        try {
            for (int i = 1; i <= 5; i++) {
                String email = "recovery_" + System.currentTimeMillis() + "_" + i + "@aivoting.fix";
                com.aivoting.entity.User user = com.aivoting.entity.User.builder()
                        .name("Pesquisa Integrada " + i)
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .course("Recuperação de Dados")
                        .institution("AIVoting System")
                        .role("ROLE_USER")
                        .build();
                
                com.aivoting.entity.User saved = userRepository.save(user);

                // 2 Votos para preencher o banco
                voteRepository.save(com.aivoting.entity.Vote.builder().user(saved).aiName("ChatGPT").build());
                voteRepository.save(com.aivoting.entity.Vote.builder().user(saved).aiName("Claude").build());

                // Resposta com Estudo e Trabalho = true
                questionResponseRepository.save(com.aivoting.entity.QuestionResponse.builder()
                        .user(saved)
                        .useForStudy(true)
                        .useForWork(true)
                        .workArea("TI")
                        .whereUseAi("Trabalho, Estudo")
                        .whyUseAi("Produtividade")
                        .howUseAi("Chat")
                        .answeredAt(java.time.LocalDateTime.now())
                        .build());
            }
            return ResponseEntity.ok(Map.of("message", "5 registros de recuperação adicionados com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
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

    private Boolean toBoolean(Object obj) {
        if (obj == null) return false;
        if (obj instanceof Boolean) return (Boolean) obj;
        if (obj instanceof String) return "true".equalsIgnoreCase((String) obj);
        if (obj instanceof Number) return ((Number) obj).intValue() == 1;
        return false;
    }
}
