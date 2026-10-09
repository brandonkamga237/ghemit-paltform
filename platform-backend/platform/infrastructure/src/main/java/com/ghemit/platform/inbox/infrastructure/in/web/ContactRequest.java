package com.ghemit.platform.inbox.infrastructure.in.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Message du formulaire de contact ; tailles bornées pour éviter les envois démesurés. */
public record ContactRequest(@Size(max = 200) String name, @NotBlank @Email @Size(max = 254) String email,
		@Size(max = 200) String subject, @NotBlank @Size(max = 5000) String message) {
}
