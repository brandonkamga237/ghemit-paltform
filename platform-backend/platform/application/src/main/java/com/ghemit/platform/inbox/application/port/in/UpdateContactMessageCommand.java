package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.ContactMessageId;

/** Mise à jour partielle : {@code read} à {@code null} laisse la valeur inchangée. */
public record UpdateContactMessageCommand(ContactMessageId id, Boolean read) {
}
