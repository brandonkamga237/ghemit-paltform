package com.ghemit.platform.content.application.port.in;

import com.ghemit.platform.content.domain.ContentItemId;
import com.ghemit.platform.content.domain.Payload;

/** Mise à jour partielle : seuls les champs non {@code null} sont appliqués. */
public record UpdateContentItemCommand(ContentItemId id, String slug, Integer position, Payload payload) {
}
