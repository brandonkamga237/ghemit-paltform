package com.ghemit.platform.newsletter.infrastructure.in.web;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record SendRequest(@NotBlank String subject, @NotBlank String body, List<String> audience) {
}
