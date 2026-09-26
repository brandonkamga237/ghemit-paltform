package com.ghemit.platform.media.application;

import com.ghemit.platform.media.application.port.in.ManageMediaUseCase;
import com.ghemit.platform.media.application.port.in.MediaLibraryQuery;
import com.ghemit.platform.media.application.port.in.UploadMediaCommand;
import com.ghemit.platform.media.application.port.out.FileStorage;
import com.ghemit.platform.media.application.port.out.MediaFolderCatalog;
import com.ghemit.platform.media.domain.MediaFile;
import com.ghemit.platform.media.domain.MediaFileId;
import com.ghemit.platform.media.domain.MediaFileRepository;
import com.ghemit.platform.media.domain.MediaFolder;
import com.ghemit.platform.media.domain.ObjectKey;
import com.ghemit.platform.shared.application.BinaryContent;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.transaction.annotation.Transactional;

/** Gestion de la médiathèque : fichiers, dossiers et stockage d'objets. */
public class MediaLibraryService implements MediaLibraryQuery, ManageMediaUseCase {

	private final MediaFileRepository repository;
	private final FileStorage storage;
	private final MediaFolderCatalog folderCatalog;

	public MediaLibraryService(MediaFileRepository repository, FileStorage storage,
			MediaFolderCatalog folderCatalog) {
		this.repository = repository;
		this.storage = storage;
		this.folderCatalog = folderCatalog;
	}

	@Override
	public List<MediaFile> list(MediaFolder folder) {
		List<MediaFile> all = repository.findAll();
		return folder == null ? all : all.stream().filter(media -> media.isIn(folder)).toList();
	}

	@Override
	public List<String> folderNames() {
		Set<String> names = new LinkedHashSet<>();
		folderCatalog.declared().stream().map(MediaFolder::name).forEach(names::add);
		repository.findAll().stream()
				.map(MediaFile::folder)
				.filter(folder -> !folder.isRoot())
				.map(MediaFolder::name)
				.forEach(names::add);
		return names.stream().sorted().toList();
	}

	@Override
	@Transactional
	public MediaFile upload(UploadMediaCommand command) {
		BinaryContent content = command.content();
		ObjectKey key = ObjectKey.forLibrary(content.filename());
		storage.put(key, content.stream(), content.size(), content.contentType());
		return repository.save(MediaFile.register(
				key, content.filename(), content.contentType(), command.folder(), content.size()));
	}

	@Override
	@Transactional
	public void delete(MediaFileId id) {
		MediaFile media = repository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Média introuvable"));
		storage.remove(media.objectKey());
		repository.delete(media);
	}

	@Override
	@Transactional
	public List<String> createFolder(MediaFolder folder) {
		folderCatalog.declare(folder);
		return folderNames();
	}

	@Override
	@Transactional
	public List<String> deleteFolder(MediaFolder folder) {
		folderCatalog.remove(folder);
		repository.findAll().stream()
				.filter(media -> media.isIn(folder))
				.forEach(media -> {
					media.moveToRoot();
					repository.save(media);
				});
		return folderNames();
	}
}
