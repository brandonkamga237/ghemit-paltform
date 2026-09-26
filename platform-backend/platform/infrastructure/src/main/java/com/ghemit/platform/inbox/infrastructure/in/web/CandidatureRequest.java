package com.ghemit.platform.inbox.infrastructure.in.web;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public record CandidatureRequest(@NotBlank String program, Map<String, Object> form) {
}
