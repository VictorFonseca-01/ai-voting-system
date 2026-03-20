package com.aivoting.security;

import com.aivoting.entity.User;
import com.aivoting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


/**
 * Implementação do UserDetailsService do Spring Security.
 * Carrega o usuário pelo email para autenticação.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Carrega usuário pelo email (usado como username no sistema).
     * @param email Email do usuário
     * @return UserDetails com dados do usuário
     * @throws UsernameNotFoundException se o usuário não for encontrado
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));

        // Retorna o UserDetails com email, senha criptografada e a role específica
        java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = 
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole()));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
