package com.ghemit.platform.content.application;

import com.ghemit.platform.content.application.port.in.ContentCatalogQuery;
import com.ghemit.platform.content.application.port.in.CreateContentItemCommand;
import com.ghemit.platform.content.application.port.in.ManageContentUseCase;
import com.ghemit.platform.content.application.port.in.UpdateContentItemCommand;
import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemId;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

/** Orchestration de la consultation et de l'édition du contenu éditorial. */
public class ContentCatalogService implements ContentCatalogQuery, ManageContentUseCase {

	private final ContentItemRepository repository;

	public ContentCatalogService(ContentItemRepository repository) {
		this.repository = repository;
	}

	@Override
	public List<ContentItem> byType(ContentType type) {
		return repository.findByType(type);
	}

	@Override
	public Map<ContentType, List<ContentItem>> groupedByType() {
		Map<ContentType, List<ContentItem>> grouped = new LinkedHashMap<>();
		for (ContentType type : ContentType.values()) {
			grouped.put(type, repository.findByType(type));
		}
		return grouped;
	}

	@Override
	@Transactional
	public ContentItem create(CreateContentItemCommand command) {
		int position = command.position() != null ? command.position() : nextPosition(command.type());
		return repository.save(
				ContentItem.create(command.type(), command.slug(), position, command.payload()));
	}

	@Override
	@Transactional
	public ContentItem update(UpdateContentItemCommand command) {
		ContentItem item = require(command.id());
		if (command.slug() != null) {
			item.changeSlug(command.slug());
		}
		if (command.position() != null) {
			item.moveTo(command.position());
		}
		if (command.payload() != null) {
			item.replacePayload(command.payload());
		}
		return repository.save(item);
	}

	@Override
	@Transactional
	public void delete(ContentItemId id) {
		repository.delete(require(id));
	}

	private ContentItem require(ContentItemId id) {
		return repository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Contenu introuvable"));
	}

	private int nextPosition(ContentType type) {
		return repository.findByType(type).stream()
				.mapToInt(ContentItem::position)
				.max()
				.orElse(-1) + 1;
	}
}
