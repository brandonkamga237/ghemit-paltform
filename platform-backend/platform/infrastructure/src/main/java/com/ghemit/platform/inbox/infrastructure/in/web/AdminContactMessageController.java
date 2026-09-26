package com.ghemit.platform.inbox.infrastructure.in.web;

import com.ghemit.platform.inbox.application.port.in.ContactMessageQuery;
import com.ghemit.platform.inbox.application.port.in.ContactMessageSummary;
import com.ghemit.platform.inbox.application.port.in.ManageContactMessagesUseCase;
import com.ghemit.platform.inbox.application.port.in.UpdateContactMessageCommand;
import com.ghemit.platform.inbox.domain.ContactMessageCriteria;
import com.ghemit.platform.inbox.domain.ContactMessageId;
import com.ghemit.platform.shared.infrastructure.in.web.PageRequestMapper;
import com.ghemit.platform.shared.infrastructure.in.web.PageResponse;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/messages")
@RequiredArgsConstructor
public class AdminContactMessageController {

	private final ContactMessageQuery query;
	private final ManageContactMessagesUseCase manageMessages;

	@GetMapping
	public PageResponse<ContactMessageResponse> search(
			@RequestParam(value = "read", required = false) Boolean read,
			@RequestParam(value = "q", required = false) String q,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "20") int size,
			@RequestParam(value = "sort", defaultValue = "createdAt,desc") String sort) {
		return PageResponse.of(
				query.search(new ContactMessageCriteria(read, q), PageRequestMapper.from(page, size, sort)),
				ContactMessageResponse::from);
	}

	@GetMapping("/summary")
	public ContactMessageSummary summary() {
		return query.summary();
	}

	@PatchMapping("/{id}/read")
	public ContactMessageResponse markRead(@PathVariable UUID id) {
		return ContactMessageResponse.from(manageMessages.markAsRead(ContactMessageId.of(id)));
	}

	@PatchMapping("/{id}")
	public ContactMessageResponse update(@PathVariable UUID id, @RequestBody Map<String, Object> patch) {
		Boolean read = patch.get("readFlag") instanceof Boolean value ? value : null;
		return ContactMessageResponse.from(manageMessages.update(
				new UpdateContactMessageCommand(ContactMessageId.of(id), read)));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable UUID id) {
		manageMessages.delete(ContactMessageId.of(id));
	}
}
