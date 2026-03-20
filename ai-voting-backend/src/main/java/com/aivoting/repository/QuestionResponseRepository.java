package com.aivoting.repository;

import com.aivoting.entity.QuestionResponse;
import com.aivoting.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório para operações com respostas do questionário.
 */
@Repository
public interface QuestionResponseRepository extends JpaRepository<QuestionResponse, Long> {

    /** Busca a resposta de um usuário específico */
    Optional<QuestionResponse> findByUserId(Long userId);

    /** Verifica se o usuário já respondeu o questionário */
    boolean existsByUserId(Long userId);

    /** Remove todas as respostas de um usuário específico */
    void deleteByUser(User user);

    // ============================================
    // QUERIES PARA O DASHBOARD
    // ============================================

    /** Contagem por área de trabalho */
    @Query("SELECT q.workArea, COUNT(q) FROM QuestionResponse q GROUP BY q.workArea ORDER BY COUNT(q) DESC")
    List<Object[]> countByWorkArea();
}
