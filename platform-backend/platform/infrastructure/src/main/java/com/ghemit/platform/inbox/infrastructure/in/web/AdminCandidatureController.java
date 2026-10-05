package com.ghemit.platform.inbox.infrastructure.in.web;

import com.ghemit.platform.inbox.application.port.in.CandidatureQuery;
import com.ghemit.platform.inbox.application.port.in.CandidatureSummary;
import com.ghemit.platform.inbox.application.port.in.ManageCandidaturesUseCase;
import com.ghemit.platform.inbox.application.port.in.UpdateCandidatureCommand;
import com.ghemit.platform.inbox.domain.CandidatureCriteria;
import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureStatus;
import com.ghemit.platform.inbox.domain.ProgramCode;
import com.ghemit.platform.shared.infrastructure.in.web.PageRequestMapper;
import com.ghemit.platform.shared.infrastructure.in.web.PageResponse;
import java.util.Arrays;
import java.util.List;
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
@RequestMapping("/api/admin/candidatures")
@RequiredArgsConstructor
public class AdminCandidatureController {

	private final CandidatureQuery query;
	private final ManageCandidaturesUseCase manageCandidatures;

	@GetMapping
	public PageResponse<CandidatureResponse> search(
			@RequestParam(value = "program", required = false) String program,
			@RequestParam(value = "read", required = false) Boolean read,
			@RequestParam(value = "status", required = false) String status,
			@RequestParam(value = "q", required = false) String q,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "20") int size,
			@RequestParam(value = "sort", defaultValue = "createdAt,desc") String sort) {
		CandidatureCriteria criteria = new CandidatureCriteria(
				programCodes(program), read, statusOrNull(status), q);
		return PageResponse.of(query.search(criteria, PageRequestMapper.from(page, size, sort)),
				CandidatureResponse::from);
	}

	@GetMapping("/summary")
	public CandidatureSummary summary() {
		return query.summary();
	}

	@PatchMapping("/{id}")
	public CandidatureResponse update(@PathVariable UUID id, @RequestBody Map<String, Object> patch) {
		Boolean read = patch.get("readFlag") instanceof Boolean value ? value : null;
		CandidatureStatus status = patch.get("status") instanceof String code
				? CandidatureStatus.fromCode(code)
				: null;
		boolean noteProvided = patch.containsKey("note");
		Object note = patch.get("note");
		return CandidatureResponse.from(manageCandidatures.update(new UpdateCandidatureCommand(
				CandidatureId.of(id), read, status, noteProvided,
				note == null ? null : String.valueOf(note))));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable UUID id) {
		manageCandidatures.delete(CandidatureId.of(id));
	}

	/** Le paramètre « program » accepte plusieurs programmes séparés par des virgules. */
	private static List<ProgramCode> programCodes(String program) {
		if (program == null || program.isBlank()) {
			return List.of();
		}
		return Arrays.stream(program.split(","))
				.map(String::trim)
				.filter(value -> !value.isEmpty())
				.map(ProgramCode::of)
				.toList();
	}

	private static CandidatureStatus statusOrNull(String status) {
		return status == null || status.isBlank() ? null : CandidatureStatus.fromCode(status);
	}
}
