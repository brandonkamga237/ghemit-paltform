package com.ghemit.platform.media.infrastructure.in.web;

import com.ghemit.platform.media.application.port.in.DownloadMediaQuery;
import com.ghemit.platform.media.application.port.in.MediaDownload;
import com.ghemit.platform.media.application.port.in.UploadCvUseCase;
import com.ghemit.platform.media.application.port.out.StoredObject;
import com.ghemit.platform.media.domain.ObjectKey;
import com.ghemit.platform.shared.application.BinaryContent;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicMediaController {

	private static final String IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

	private final UploadCvUseCase uploadCv;
	private final DownloadMediaQuery downloadMedia;

	@PostMapping("/cv")
	public CvUploadResponse uploadCv(@RequestParam("file") MultipartFile file) throws IOException {
		BinaryContent content = new BinaryContent(file.getOriginalFilename(), file.getContentType(),
				file.getSize(), file.getInputStream());
		return CvUploadResponse.from(uploadCv.upload(content));
	}

	@GetMapping("/media/{*key}")
	public ResponseEntity<StreamingResponseBody> serve(@PathVariable("key") String rawKey) {
		// {*key} peut capturer un « / » initial selon le moteur de patterns
		String key = rawKey.startsWith("/") ? rawKey.substring(1) : rawKey;
		MediaDownload download = downloadMedia.download(ObjectKey.of(key));

		StreamingResponseBody body = out -> {
			try (StoredObject object = download.object()) {
				object.stream().transferTo(out);
			}
		};
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(download.contentType()))
				.header("Cache-Control", IMMUTABLE_CACHE)
				.body(body);
	}
}
