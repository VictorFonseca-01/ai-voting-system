package com.aivoting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal da aplicação AI Voting System.
 * Sistema de votação e coleta de respostas sobre Inteligências Artificiais.
 */
@SpringBootApplication
public class AiVotingApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiVotingApplication.class, args);
        System.out.println("====================================");
        System.out.println("  AI VOTING SYSTEM - Iniciado!");
        System.out.println("  Backend: http://localhost:8080");
        System.out.println("  H2 Console: http://localhost:8080/h2-console");
        System.out.println("====================================");
    }
}
