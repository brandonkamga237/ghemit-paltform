package com.ghemit.platform.content.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.time.Instant;
import java.util.Objects;

/**
 * Agrégat racine du contenu éditorial : un élément typé, positionné et porteur
 * d'un corps JSON libre.
 */
public final class ContentItem {

	private final ContentItemId id;
	private final ContentType type;
	private String slug;
	private int position;
	private Payload payload;
	private Instant updatedAt;

	private ContentItem(ContentItemId id, ContentType type, String slug, int position,
			Payload payload, Instant updatedAt) {
		this.id = Objects.requireNonNull(id);
		this.type = Objects.requireNonNull(type, "Le type de contenu est obligatoire");
		this.slug = normalizeSlug(slug);
		this.position = requireValidPosition(position);
		this.payload = payload == null ? Payload.empty() : payload;
		this.updatedAt = Objects.requireNonNull(updatedAt);
	}

	public static ContentItem create(ContentType type, String slug, int position, Payload payload) {
		return new ContentItem(ContentItemId.newId(), type, slug, position, payload, Instant.now());
	}

	/** Reconstitution depuis le stockage : aucune règle de création n'est rejouée. */
	public static ContentItem rehydrate(ContentItemId id, ContentType type, String slug, int position,
			Payload payload, Instant updatedAt) {
		return new ContentItem(id, type, slug, position, payload, updatedAt);
	}

	public void changeSlug(String slug) {
		this.slug = normalizeSlug(slug);
		touch();
	}

	public void moveTo(int position) {
		this.position = requireValidPosition(position);
		touch();
	}

	public void replacePayload(Payload payload) {
		this.payload = payload == null ? Payload.empty() : payload;
		touch();
	}

	public void putPayloadEntry(String key, Object value) {
		this.payload = this.payload.with(key, value);
		touch();
	}

	private void touch() {
		this.updatedAt = Instant.now();
	}

	private static String normalizeSlug(String slug) {
		if (slug == null) {
			return null;
		}
		String trimmed = slug.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private static int requireValidPosition(int position) {
		if (position < 0) {
			throw new BusinessRuleViolationException("La position doit être positive");
		}
		return position;
	}

	public ContentItemId id() {
		return id;
	}

	public ContentType type() {
		return type;
	}

	public String slug() {
		return slug;
	}

	public int position() {
		return position;
	}

	public Payload payload() {
		return payload;
	}

	public Instant updatedAt() {
		return updatedAt;
	}
}
