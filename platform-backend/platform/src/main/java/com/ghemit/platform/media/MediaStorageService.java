package com.ghemit.platform.media;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.InputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaStorageService {

	private static final Logger log = LoggerFactory.getLogger(MediaStorageService.class);

	private final MinioClient client;
	private final String bucket;

	public MediaStorageService(
			@Value("${app.minio.endpoint}") String endpoint,
			@Value("${app.minio.access-key}") String accessKey,
			@Value("${app.minio.secret-key}") String secretKey,
			@Value("${app.minio.bucket}") String bucket) {
		this.client = MinioClient.builder()
				.endpoint(endpoint)
				.credentials(accessKey, secretKey)
				.build();
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

	public void put(String objectKey, InputStream in, long size, String contentType) {
		try {
			client.putObject(PutObjectArgs.builder()
					.bucket(bucket)
					.object(objectKey)
					.stream(in, size, -1)
					.contentType(contentType != null ? contentType : "application/octet-stream")
					.build());
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Échec de l'upload vers MinIO", e);
		}
	}

	public GetObjectResponse get(String objectKey) {
		try {
			return client.getObject(GetObjectArgs.builder().bucket(bucket).object(objectKey).build());
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Média introuvable", e);
		}
	}

	public void remove(String objectKey) {
		try {
			client.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(objectKey).build());
		} catch (Exception e) {
			log.warn("Suppression MinIO impossible pour {} : {}", objectKey, e.getMessage());
		}
	}
}
