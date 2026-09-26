package com.ghemit.platform.content.infrastructure.in.web;

import com.ghemit.platform.content.application.port.in.ContentCatalogQuery;
import com.ghemit.platform.content.application.port.in.CreateContentItemCommand;
import com.ghemit.platform.content.application.port.in.ManageContentUseCase;
import com.ghemit.platform.content.application.port.in.UpdateContentItemCommand;
import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemId;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
public class AdminContentController {

	private final ContentCatalogQuery catalogQuery;
	private final ManageContentUseCase manageContent;

	@GetMapping
	public Map<String, List<ContentItemResponse>> all() {
		Map<String, List<ContentItemResponse>> grouped = new LinkedHashMap<>();
		catalogQuery.groupedByType()
				.forEach((type, items) -> grouped.put(type.path(), responses(items)));
		return grouped;
	}

	@GetMapping("/{type}")
	public List<ContentItemResponse> list(@PathVariable String type) {
		return responses(catalogQuery.byType(ContentType.fromPath(type)));
	}

	@PostMapping("/{type}")
	@ResponseStatus(HttpStatus.CREATED)
	public ContentItemResponse create(@PathVariable String type, @RequestBody ContentItemRequest request) {
		return ContentItemResponse.from(manageContent.create(new CreateContentItemCommand(
				ContentType.fromPath(type), request.slug(), request.position(),
				Payload.of(request.payload()))));
	}

	@PutMapping("/{id}")
	public ContentItemResponse update(@PathVariable UUID id, @RequestBody ContentItemRequest request) {
		return ContentItemResponse.from(manageContent.update(new UpdateContentItemCommand(
				ContentItemId.of(id), request.slug(), request.position(),
				request.payload() == null ? null : Payload.of(request.payload()))));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable UUID id) {
		manageContent.delete(ContentItemId.of(id));
	}

	private static List<ContentItemResponse> responses(List<ContentItem> items) {
		return items.stream().map(ContentItemResponse::from).toList();
	}
}
