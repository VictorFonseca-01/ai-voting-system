package com.aivoting.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.aivoting.entity.User;
import com.aivoting.entity.Vote;

/**
 * Repositório para operações com votos.
 */
@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    /** Conta quantos votos um usuário já deu */
    long countByUserId(Long userId);

    /** Verifica se o usuário já votou em determinada IA */
    boolean existsByUserIdAndAiName(Long userId, String aiName);

    /** Lista todos os votos de um usuário */
    List<Vote> findByUserId(Long userId);

    /** Remove todos os votos de um usuário específico */
    void deleteByUser(User user);

    /**
     * Conta votos agrupados por IA.
     * Retorna lista de arrays [aiName, count].
     */
    @Query("SELECT v.aiName, COUNT(v) FROM Vote v GROUP BY v.aiName ORDER BY COUNT(v) DESC")
    List<Object[]> countVotesByAi();

    /** Total geral de votos no sistema */
    @Query("SELECT COUNT(v) FROM Vote v")
    long countTotalVotes();
}
