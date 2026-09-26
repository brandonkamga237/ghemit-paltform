package com.ghemit.platform.newsletter.infrastructure.in.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SubscribeRequest(@NotBlank @Email String email, String name, String source) {
}
