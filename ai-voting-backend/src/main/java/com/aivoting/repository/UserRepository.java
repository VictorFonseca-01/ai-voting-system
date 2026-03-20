package com.aivoting.repository;

import com.aivoting.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório para operações de banco de dados com a entidade User.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Busca usuário pelo email (usado no login) */
    Optional<User> findByEmail(String email);

    /** Verifica se já existe um usuário com o email fornecido */
    boolean existsByEmail(String email);
}
