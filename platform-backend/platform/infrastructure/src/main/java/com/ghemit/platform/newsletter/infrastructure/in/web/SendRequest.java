package com.ghemit.platform.newsletter.infrastructure.in.web;

import jakarta.validation.constraints.NotBlank;

public record SendRequest(@NotBlank String subject, @NotBlank String body) {
}
