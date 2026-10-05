package com.ghemit.platform.media.infrastructure.in.web;

import com.ghemit.platform.media.application.port.in.DownloadMediaQuery;
import com.ghemit.platform.media.application.port.in.MediaDownload;
import com.ghemit.platform.media.application.port.in.UploadCvUseCase;
import com.ghemit.platform.media.application.port.out.StorageUnavailableException;
import com.ghemit.platform.media.application.port.out.StoredObject;
import com.ghemit.platform.media.domain.ObjectKey;
import com.ghemit.platform.shared.application.BinaryContent;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
	public ResponseEntity<byte[]> serve(@PathVariable("key") String rawKey,
			@RequestParam(value = "w", required = false) Integer width) {
		// {*key} peut capturer un « / » initial selon le moteur de patterns
		String key = rawKey.startsWith("/") ? rawKey.substring(1) : rawKey;
		ObjectKey objectKey = ObjectKey.of(key);
		// Les CV contiennent des données personnelles : servis uniquement via /api/admin/media/cv
		if (objectKey.isCv()) {
			return ResponseEntity.notFound().build();
		}
		MediaDownload download = downloadMedia.download(objectKey);

		try (StoredObject object = download.object()) {
			byte[] original = object.stream().readAllBytes();
			byte[] payload;
			String outContentType;
			if (width == null) {
				payload = original;
				outContentType = download.contentType();
			} else {
				payload = resize(original, width, download.contentType());
				outContentType = isPng(download.contentType()) ? "image/png" : "image/jpeg";
			}
			return ResponseEntity.ok()
					.contentType(MediaType.parseMediaType(outContentType))
					.contentLength(payload.length)
					.header("Cache-Control", IMMUTABLE_CACHE)
					.body(payload);
		} catch (IOException e) {
			throw new StorageUnavailableException("Échec de la lecture ou du redimensionnement du média", e);
		}
	}

	private byte[] resize(byte[] original, int width, String contentType) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		String format = isPng(contentType) ? "png" : "jpg";
		Thumbnails.of(new ByteArrayInputStream(original))
				.width(width)
				.useExifOrientation(true)
				.outputFormat(format)
				.outputQuality(0.85)
				.toOutputStream(out);
		return out.toByteArray();
	}

	private boolean isPng(String contentType) {
		return contentType != null && contentType.toLowerCase().contains("png");
	}
}
