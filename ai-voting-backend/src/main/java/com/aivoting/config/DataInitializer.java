package com.aivoting.config;

import com.aivoting.entity.User;
import com.aivoting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicializador de dados.
 * Garante que o usuário Admin Master exista ao iniciar a aplicação.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@aivoting.com";
    private static final String ADMIN_PASSWORD = "Admin@2026";
    private static final String ADMIN_NAME = "Administrador";

    @Override
    public void run(String... args) {
        createAdminIfNotExists();
    }

    /**
     * Cria o usuário admin padrão se ele ainda não existir.
     */
    public void createAdminIfNotExists() {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            User admin = User.builder()
                    .name(ADMIN_NAME)
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .role("ROLE_ADMIN")
                    .build();

            userRepository.save(admin);
            log.info("✅ Admin Master criado: {} / {}", ADMIN_EMAIL, ADMIN_PASSWORD);
        } else {
            log.info("ℹ️ Admin Master já existe: {}", ADMIN_EMAIL);
        }
    }
}
