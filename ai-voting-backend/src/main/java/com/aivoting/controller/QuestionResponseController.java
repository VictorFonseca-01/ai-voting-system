package com.aivoting.controller;

import com.aivoting.dto.QuestionResponseRequest;
import com.aivoting.entity.QuestionResponse;
import com.aivoting.service.QuestionResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller para o questionário.
 * Endpoints requerem autenticação JWT.
 */
@RestController
@RequestMapping("/api/questionnaire")
@RequiredArgsConstructor
public class QuestionResponseController {

    private final QuestionResponseService questionResponseService;

    /**
     * POST /api/questionnaire
     * Salva as respostas do usuário autenticado.
     */
    @PostMapping
    public ResponseEntity<?> submitResponse(@RequestBody QuestionResponseRequest request) {
        try {
            QuestionResponse response = questionResponseService.submitResponse(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Respostas salvas com sucesso!",
                    "id", response.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/questionnaire/status
     * Verifica se o usuário já respondeu o questionário.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(Map.of("hasAnswered", questionResponseService.hasUserAnswered()));
    }

    /**
     * GET /api/questionnaire/my
     * Retorna as respostas do usuário autenticado.
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyResponse() {
        QuestionResponse response = questionResponseService.getUserResponse();
        if (response == null) {
            return ResponseEntity.ok(Map.of("answered", false));
        }
        return ResponseEntity.ok(Map.of(
                "answered", true,
                "whereUseAi", response.getWhereUseAi() != null ? response.getWhereUseAi() : "",
                "whyUseAi", response.getWhyUseAi() != null ? response.getWhyUseAi() : "",
                "howUseAi", response.getHowUseAi() != null ? response.getHowUseAi() : "",
                "useForStudy", response.getUseForStudy() != null ? response.getUseForStudy() : false,
                "useForWork", response.getUseForWork() != null ? response.getUseForWork() : false,
                "workArea", response.getWorkArea() != null ? response.getWorkArea() : "",
                "workAreaOther", response.getWorkAreaOther() != null ? response.getWorkAreaOther() : ""
        ));
    }
}
