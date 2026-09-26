package com.ghemit.platform.media.infrastructure.in.web;

import com.ghemit.platform.media.application.port.in.ManageMediaUseCase;
import com.ghemit.platform.media.application.port.in.MediaLibraryQuery;
import com.ghemit.platform.media.application.port.in.UploadMediaCommand;
import com.ghemit.platform.media.domain.MediaFileId;
import com.ghemit.platform.media.domain.MediaFolder;
import com.ghemit.platform.shared.application.BinaryContent;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

	private static final String DEFAULT_FILENAME = "fichier";

	private final MediaLibraryQuery libraryQuery;
	private final ManageMediaUseCase manageMedia;

	@GetMapping
	public List<MediaFileResponse> list(@RequestParam(value = "folder", required = false) String folder) {
		return libraryQuery.list(folder == null ? null : MediaFolder.of(folder)).stream()
				.map(MediaFileResponse::from)
				.toList();
	}

	@GetMapping("/folders")
	public List<String> folders() {
		return libraryQuery.folderNames();
	}

	@PostMapping("/folders")
	public List<String> createFolder(@RequestBody Map<String, String> body) {
		return manageMedia.createFolder(MediaFolder.named(body.get("name")));
	}

	@DeleteMapping("/folders/{name}")
	public List<String> deleteFolder(@PathVariable String name) {
		return manageMedia.deleteFolder(MediaFolder.of(name));
	}

	@PostMapping
	public MediaFileResponse upload(@RequestParam("file") MultipartFile file,
			@RequestParam(value = "folder", required = false, defaultValue = "") String folder)
			throws IOException {
		String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : DEFAULT_FILENAME;
		BinaryContent content = new BinaryContent(
				filename, file.getContentType(), file.getSize(), file.getInputStream());
		return MediaFileResponse.from(
				manageMedia.upload(new UploadMediaCommand(content, MediaFolder.of(folder))));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable UUID id) {
		manageMedia.delete(MediaFileId.of(id));
	}
}
