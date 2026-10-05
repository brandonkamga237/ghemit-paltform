package com.ghemit.platform.content.infrastructure.in.web;

import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import java.time.Duration;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicContentController {

	private final PublicContentQuery publicContentQuery;

	@GetMapping("/content")
	public ResponseEntity<PublicContentResponse> content() {
		return ResponseEntity.ok()
				.cacheControl(CacheControl.maxAge(Duration.ofMinutes(1)).cachePublic())
				.body(PublicContentResponse.from(publicContentQuery.publicContent()));
	}

	@GetMapping("/articles/{slug}")
	public ResponseEntity<Map<String, Object>> article(@PathVariable String slug) {
		return ResponseEntity.ok()
				.cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
				.body(publicContentQuery.publishedArticle(slug));
	}
}
