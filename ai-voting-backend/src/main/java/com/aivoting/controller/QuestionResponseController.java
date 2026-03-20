package com.aivoting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para o questionário.
 * Endpoints legados foram removidos em favor do ParticipationController.
 */
@RestController
@RequestMapping("/api/questionnaire")
@RequiredArgsConstructor
public class QuestionResponseController {

    // O sistema agora utiliza ParticipationController para submissões anônimas.
}
