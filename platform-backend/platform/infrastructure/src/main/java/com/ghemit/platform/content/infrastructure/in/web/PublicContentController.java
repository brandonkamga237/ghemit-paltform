package com.ghemit.platform.content.infrastructure.in.web;

import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicContentController {

	private final PublicContentQuery publicContentQuery;

	@GetMapping("/content")
	public PublicContentResponse content() {
		return PublicContentResponse.from(publicContentQuery.publicContent());
	}
}
