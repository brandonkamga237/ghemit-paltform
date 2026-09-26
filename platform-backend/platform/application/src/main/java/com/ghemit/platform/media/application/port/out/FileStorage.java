package com.ghemit.platform.media.application.port.out;

import com.ghemit.platform.media.domain.ObjectKey;
import java.io.InputStream;

/** Port sortant vers le stockage d'objets (MinIO / S3). */
public interface FileStorage {

	void put(ObjectKey key, InputStream content, long size, String contentType);

	StoredObject get(ObjectKey key);

	void remove(ObjectKey key);
}
