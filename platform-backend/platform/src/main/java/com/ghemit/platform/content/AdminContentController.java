package com.ghemit.platform.content;

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

	private final ContentService service;

	public record ContentItemRequest(String slug, Integer position, Map<String, Object> payload) {}

	@GetMapping
	public Map<String, List<ContentItem>> all() {
		return service.listAll();
	}

	@GetMapping("/{type}")
	public List<ContentItem> list(@PathVariable String type) {
		return service.list(ContentType.fromPath(type));
	}

	@PostMapping("/{type}")
	@ResponseStatus(HttpStatus.CREATED)
	public ContentItem create(@PathVariable String type, @RequestBody ContentItemRequest req) {
		return service.create(ContentType.fromPath(type), req.slug(), req.position(), req.payload());
	}

	@PutMapping("/{id}")
	public ContentItem update(@PathVariable UUID id, @RequestBody ContentItemRequest req) {
		return service.update(id, req.slug(), req.position(), req.payload());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable UUID id) {
		service.delete(id);
	}
}
