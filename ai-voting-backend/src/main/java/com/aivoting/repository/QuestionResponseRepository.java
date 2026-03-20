package com.aivoting.repository;

import com.aivoting.entity.QuestionResponse;
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

    // ============================================
    // QUERIES PARA O DASHBOARD
    // ============================================

    /** Contagem de respostas por "onde usa IA" */
    @Query("SELECT q.whereUseAi, COUNT(q) FROM QuestionResponse q GROUP BY q.whereUseAi")
    List<Object[]> countByWhereUseAi();

    /** Contagem de respostas por "por que usa IA" */
    @Query("SELECT q.whyUseAi, COUNT(q) FROM QuestionResponse q GROUP BY q.whyUseAi")
    List<Object[]> countByWhyUseAi();

    /** Contagem de respostas por "como usa IA" */
    @Query("SELECT q.howUseAi, COUNT(q) FROM QuestionResponse q GROUP BY q.howUseAi")
    List<Object[]> countByHowUseAi();

    /** Quantos usam IA para estudo */
    @Query("SELECT COUNT(q) FROM QuestionResponse q WHERE q.useForStudy = true")
    long countUseForStudy();

    /** Quantos usam IA para trabalho */
    @Query("SELECT COUNT(q) FROM QuestionResponse q WHERE q.useForWork = true")
    long countUseForWork();

    /** Contagem por área de trabalho */
    @Query("SELECT q.workArea, COUNT(q) FROM QuestionResponse q GROUP BY q.workArea ORDER BY COUNT(q) DESC")
    List<Object[]> countByWorkArea();

    /** Total de respondentes */
    @Query("SELECT COUNT(q) FROM QuestionResponse q")
    long countTotalResponses();
}
