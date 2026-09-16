package com.ghemit.platform.media;

import io.minio.GetObjectResponse;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequiredArgsConstructor
public class MediaController {

	private final MediaFileRepository repository;
	private final MediaStorageService storage;

	// ---- Admin ----

	@GetMapping("/api/admin/media")
	public List<MediaFile> list() {
		return repository.findAll();
	}

	@PostMapping("/api/admin/media")
	public MediaFile upload(@RequestParam("file") MultipartFile file) throws IOException {
		String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "fichier";
		String objectKey = UUID.randomUUID() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
		storage.put(objectKey, file.getInputStream(), file.getSize(), file.getContentType());

		MediaFile media = new MediaFile();
		media.setObjectKey(objectKey);
		media.setFilename(original);
		media.setContentType(file.getContentType());
		media.setSize(file.getSize());
		return repository.save(media);
	}

	@DeleteMapping("/api/admin/media/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		MediaFile media = repository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Média introuvable"));
		storage.remove(media.getObjectKey());
		repository.delete(media);
		return ResponseEntity.noContent().build();
	}

	// ---- Public ----

	@GetMapping("/api/public/media/{key}")
	public ResponseEntity<StreamingResponseBody> serve(@PathVariable String key) {
		GetObjectResponse object = storage.get(key);
		String contentType = repository.findByObjectKey(key)
				.map(MediaFile::getContentType)
				.orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);

		StreamingResponseBody body = out -> {
			try (object) {
				object.transferTo(out);
			}
		};
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType))
				.header("Cache-Control", "public, max-age=31536000, immutable")
				.body(body);
	}
}
