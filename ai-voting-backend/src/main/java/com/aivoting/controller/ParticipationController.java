package com.aivoting.controller;

import com.aivoting.dto.ParticipationRequest;
import com.aivoting.service.ParticipationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller para submissão de participação anônima.
 * Permite enviar votos e questionário em uma única chamada.
 */
@RestController
@RequestMapping("/api/participation")
@RequiredArgsConstructor
public class ParticipationController {

    private final ParticipationService participationService;

    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody ParticipationRequest request) {
        try {
            participationService.submitParticipation(request);
            return ResponseEntity.ok(Map.of("message", "Participação registrada com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
