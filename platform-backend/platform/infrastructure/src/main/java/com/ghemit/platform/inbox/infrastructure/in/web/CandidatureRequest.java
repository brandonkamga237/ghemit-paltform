package com.ghemit.platform.inbox.infrastructure.in.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

/** Candidature déposée ; le contenu du formulaire est borné par le domaine (ApplicationForm). */
public record CandidatureRequest(@NotBlank @Size(max = 64) String program, Map<String, Object> form) {
}
