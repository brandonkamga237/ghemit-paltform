package com.ghemit.platform.bootstrap;

import com.ghemit.platform.media.application.CvUploadService;
import com.ghemit.platform.media.application.MediaLibraryService;
import com.ghemit.platform.media.application.port.out.FileStorage;
import com.ghemit.platform.media.application.port.out.MediaFolderCatalog;
import com.ghemit.platform.media.domain.MediaFileRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Câblage du contexte « media ». */
@Configuration
class MediaConfiguration {

	@Bean
	MediaLibraryService mediaLibraryService(MediaFileRepository repository, FileStorage storage,
			MediaFolderCatalog folderCatalog) {
		return new MediaLibraryService(repository, storage, folderCatalog);
	}

	@Bean
	CvUploadService cvUploadService(FileStorage storage, MediaFileRepository repository) {
		return new CvUploadService(storage, repository);
	}
}
