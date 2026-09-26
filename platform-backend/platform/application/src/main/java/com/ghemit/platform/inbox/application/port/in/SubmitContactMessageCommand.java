package com.ghemit.platform.inbox.application.port.in;

public record SubmitContactMessageCommand(String name, String email, String subject, String message) {
}
