package com.ghemit.platform.media.infrastructure.out.storage;

import com.ghemit.platform.media.application.port.out.FileStorage;
import com.ghemit.platform.media.application.port.out.StorageUnavailableException;
import com.ghemit.platform.media.application.port.out.StoredObject;
import com.ghemit.platform.media.application.port.out.StoredObjectNotFoundException;
import com.ghemit.platform.media.domain.ObjectKey;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.IOException;
import java.io.InputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Adaptateur MinIO (compatible S3) du port {@link FileStorage}. */
@Slf4j
@Component
public class MinioFileStorage implements FileStorage {

	private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";

	private final MinioClient client;
	private final String bucket;

	public MinioFileStorage(
			@Value("${app.minio.endpoint}") String endpoint,
			@Value("${app.minio.access-key}") String accessKey,
			@Value("${app.minio.secret-key}") String secretKey,
			@Value("${app.minio.bucket}") String bucket) {
		this.client = MinioClient.builder().endpoint(endpoint).credentials(accessKey, secretKey).build();
		this.bucket = bucket;
		ensureBucket();
	}

	private void ensureBucket() {
		try {
			if (!client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
				client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
				log.info("Bucket MinIO '{}' créé", bucket);
			}
		} catch (Exception e) {
			log.warn("MinIO indisponible au démarrage ({}) — les uploads échoueront tant qu'il n'est pas joignable",
					e.getMessage());
		}
	}

	@Override
	public void put(ObjectKey key, InputStream content, long size, String contentType) {
		try {
			client.putObject(PutObjectArgs.builder()
					.bucket(bucket)
					.object(key.value())
					.stream(content, size, -1)
					.contentType(contentType != null ? contentType : DEFAULT_CONTENT_TYPE)
					.build());
		} catch (Exception e) {
			throw new StorageUnavailableException("Échec de l'upload vers MinIO", e);
		}
	}

	@Override
	public StoredObject get(ObjectKey key) {
		try {
			return new MinioStoredObject(
					client.getObject(GetObjectArgs.builder().bucket(bucket).object(key.value()).build()));
		} catch (Exception e) {
			throw new StoredObjectNotFoundException("Média introuvable", e);
		}
	}

	@Override
	public void remove(ObjectKey key) {
		try {
			client.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(key.value()).build());
		} catch (Exception e) {
			log.warn("Suppression MinIO impossible pour {} : {}", key.value(), e.getMessage());
		}
	}

	private record MinioStoredObject(GetObjectResponse response) implements StoredObject {

		@Override
		public InputStream stream() {
			return response;
		}

		@Override
		public void close() throws IOException {
			response.close();
		}
	}
}
