package com.ghemit.platform.content;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ContentService {

	private final ContentItemRepository repository;

	public List<ContentItem> list(ContentType type) {
		return repository.findByTypeOrderByPositionAsc(type);
	}

	public Map<String, List<ContentItem>> listAll() {
		Map<String, List<ContentItem>> grouped = new LinkedHashMap<>();
		for (ContentType type : ContentType.values()) {
			grouped.put(type.path(), list(type));
		}
		return grouped;
	}

	@Transactional
	public ContentItem create(ContentType type, String slug, Integer position, Map<String, Object> payload) {
		ContentItem item = new ContentItem();
		item.setType(type);
		item.setSlug(slug);
		int pos = position != null ? position : nextPosition(type);
		item.setPosition(pos);
		item.setPayload(payload != null ? payload : new LinkedHashMap<>());
		return repository.save(item);
	}

	@Transactional
	public ContentItem update(UUID id, String slug, Integer position, Map<String, Object> payload) {
		ContentItem item = get(id);
		if (slug != null) item.setSlug(slug);
		if (position != null) item.setPosition(position);
		if (payload != null) item.setPayload(payload);
		return repository.save(item);
	}

	@Transactional
	public void delete(UUID id) {
		repository.delete(get(id));
	}

	public ContentItem get(UUID id) {
		return repository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contenu introuvable"));
	}

	private int nextPosition(ContentType type) {
		return repository.findByTypeOrderByPositionAsc(type).stream()
				.mapToInt(ContentItem::getPosition)
				.max()
				.orElse(-1) + 1;
	}
}
