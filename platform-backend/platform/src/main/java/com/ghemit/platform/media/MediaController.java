package com.ghemit.platform.media;

import com.ghemit.platform.content.ContentItem;
import com.ghemit.platform.content.ContentItemRepository;
import com.ghemit.platform.content.ContentType;
import io.minio.GetObjectResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequiredArgsConstructor
public class MediaController {

	private static final String FOLDERS_SLUG = "media-folders";

	private final MediaFileRepository repository;
	private final MediaStorageService storage;
	private final ContentItemRepository contentRepository;

	// ---- Admin ----

	@GetMapping("/api/admin/media")
	public List<MediaFile> list(@RequestParam(value = "folder", required = false) String folder) {
		List<MediaFile> all = repository.findAll();
		if (folder == null) return all;
		return all.stream().filter(m -> folder.equals(m.getFolder())).toList();
	}

	@GetMapping("/api/admin/media/folders")
	public List<String> folders() {
		LinkedHashSet<String> names = new LinkedHashSet<>(storedFolders());
		repository.findAll().stream()
				.map(MediaFile::getFolder)
				.filter(f -> f != null && !f.isBlank())
				.forEach(names::add);
		return names.stream().sorted().collect(Collectors.toList());
	}

	@PostMapping("/api/admin/media/folders")
	public List<String> createFolder(@RequestBody Map<String, String> body) {
		String name = body.getOrDefault("name", "").trim();
		if (name.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom du dossier est requis");
		}
		ContentItem item = foldersSetting();
		List<String> items = mutableFolderList(item);
		if (!items.contains(name)) {
			items.add(name);
			item.getPayload().put("items", items);
			contentRepository.save(item);
		}
		return folders();
	}

	@DeleteMapping("/api/admin/media/folders/{name}")
	public List<String> deleteFolder(@PathVariable String name) {
		ContentItem item = foldersSetting();
		List<String> items = mutableFolderList(item);
		if (items.remove(name)) {
			item.getPayload().put("items", items);
			contentRepository.save(item);
		}
		// Les fichiers du dossier repassent à la racine
		repository.findAll().stream()
				.filter(m -> name.equals(m.getFolder()))
				.forEach(m -> {
					m.setFolder("");
					repository.save(m);
				});
		return folders();
	}

	private List<String> storedFolders() {
		return contentRepository.findByTypeAndSlug(ContentType.SETTING, FOLDERS_SLUG)
				.map(i -> {
					Object items = i.getPayload().get("items");
					if (items instanceof List<?> list) {
						return list.stream().map(String::valueOf).toList();
					}
					return List.<String>of();
				})
				.orElse(List.of());
	}

	private ContentItem foldersSetting() {
		return contentRepository.findByTypeAndSlug(ContentType.SETTING, FOLDERS_SLUG)
				.orElseGet(() -> {
					ContentItem item = new ContentItem();
					item.setType(ContentType.SETTING);
					item.setSlug(FOLDERS_SLUG);
					item.setPosition(0);
					item.getPayload().put("items", new ArrayList<String>());
					return item;
				});
	}

	private List<String> mutableFolderList(ContentItem item) {
		Object items = item.getPayload().get("items");
		List<String> list = new ArrayList<>();
		if (items instanceof List<?> raw) {
			raw.forEach(v -> list.add(String.valueOf(v)));
		}
		return list;
	}

	@PostMapping("/api/admin/media")
	public MediaFile upload(@RequestParam("file") MultipartFile file,
			@RequestParam(value = "folder", required = false, defaultValue = "") String folder) throws IOException {
		String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "fichier";
		String objectKey = UUID.randomUUID() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
		storage.put(objectKey, file.getInputStream(), file.getSize(), file.getContentType());

		MediaFile media = new MediaFile();
		media.setObjectKey(objectKey);
		media.setFilename(original);
		media.setContentType(file.getContentType());
		media.setFolder(folder == null ? "" : folder.trim());
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

	public record CvUploadResponse(String objectKey, String url, String filename) {}

	@PostMapping("/api/public/cv")
	public CvUploadResponse uploadCv(@RequestParam("file") MultipartFile file) throws IOException {
		String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv.pdf";
		String contentType = file.getContentType() != null ? file.getContentType() : "";
		boolean looksLikePdf = "application/pdf".equalsIgnoreCase(contentType)
				|| original.toLowerCase().endsWith(".pdf");
		if (!looksLikePdf) {
			throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Seuls les fichiers PDF sont acceptés");
		}
		if (file.getSize() > 2 * 1024 * 1024) {
			throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Le fichier dépasse 2 Mo");
		}
		String objectKey = "cv/" + UUID.randomUUID() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
		storage.put(objectKey, file.getInputStream(), file.getSize(), file.getContentType());
		return new CvUploadResponse(objectKey, "/api/public/media/" + objectKey, original);
	}

	@GetMapping("/api/public/media/{*key}")
	public ResponseEntity<StreamingResponseBody> serve(@PathVariable("key") String rawKey) {
		// {*key} peut capturer un « / » initial selon le moteur de patterns
		final String key = rawKey.startsWith("/") ? rawKey.substring(1) : rawKey;
		GetObjectResponse object = storage.get(key);
		String contentType = repository.findByObjectKey(key)
				.map(MediaFile::getContentType)
				.orElseGet(() -> key.startsWith("cv/")
						? MediaType.APPLICATION_PDF_VALUE
						: MediaType.APPLICATION_OCTET_STREAM_VALUE);

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
