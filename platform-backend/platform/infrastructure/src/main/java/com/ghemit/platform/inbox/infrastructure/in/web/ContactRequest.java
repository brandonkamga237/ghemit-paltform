package com.ghemit.platform.inbox.infrastructure.in.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequest(String name, @NotBlank @Email String email, String subject,
		@NotBlank String message) {
}
