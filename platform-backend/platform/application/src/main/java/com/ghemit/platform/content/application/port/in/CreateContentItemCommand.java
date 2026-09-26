package com.ghemit.platform.content.application.port.in;

import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;

/** @param position position souhaitée, ou {@code null} pour ajouter en fin de liste. */
public record CreateContentItemCommand(ContentType type, String slug, Integer position, Payload payload) {
}
