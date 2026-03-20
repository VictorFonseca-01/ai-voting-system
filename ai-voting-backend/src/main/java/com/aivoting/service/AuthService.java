package com.aivoting.service;

import com.aivoting.dto.LoginRequest;
import com.aivoting.dto.LoginResponse;
import com.aivoting.dto.RegisterRequest;
import com.aivoting.entity.User;
import com.aivoting.repository.UserRepository;
import com.aivoting.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável pelo cadastro e autenticação de usuários.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    /**
     * Registra um novo usuário no sistema.
     * @param request Dados de cadastro (nome, email, senha)
     * @return Resposta com token JWT e dados do usuário
     * @throws RuntimeException se o email já estiver em uso
     */
    public LoginResponse register(RegisterRequest request) {
        // Verifica se email já está cadastrado
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já está em uso: " + request.getEmail());
        }

        // Cria conta Master Admin se o e-mail for específico
        String role = request.getEmail().equalsIgnoreCase("admin@aivoting.com") ? "ROLE_ADMIN" : "ROLE_USER";

        // Cria e salva o novo usuário com senha criptografada
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        // Gera o token JWT para o usuário recém-cadastrado
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    /**
     * Autentica o usuário com email e senha.
     * @param request Credenciais de login
     * @return Resposta com token JWT e dados do usuário
     */
    public LoginResponse login(LoginRequest request) {
        // Autentica via Spring Security (lança exceção se credenciais erradas)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Busca o usuário e gera token JWT
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
