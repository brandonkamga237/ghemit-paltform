package com.ghemit.platform.content.infrastructure.in.web;

import java.util.Map;

/** Corps de création / mise à jour d'un contenu ; les champs absents sont ignorés. */
public record ContentItemRequest(String slug, Integer position, Map<String, Object> payload) {
}
