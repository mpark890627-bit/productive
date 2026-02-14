package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Tag;
import com.productiv.workmanagement.domain.repository.TagRepository;
import com.productiv.workmanagement.web.dto.tag.TagCreateRequest;
import com.productiv.workmanagement.web.dto.tag.TagResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public TagResponse create(TagCreateRequest request) {
        return tagRepository.findByName(request.name())
            .map(this::toResponse)
            .orElseGet(() -> {
                Tag tag = new Tag();
                tag.setName(request.name());
                return toResponse(tagRepository.save(tag));
            });
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getAll(String keyword) {
        List<Tag> tags;
        if (keyword == null || keyword.isBlank()) {
            tags = tagRepository.findAllByOrderByNameAsc();
        } else {
            tags = tagRepository.findByNameContainingIgnoreCaseOrderByNameAsc(keyword);
        }
        return tags.stream().map(this::toResponse).toList();
    }

    private TagResponse toResponse(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getCreatedAt(), tag.getUpdatedAt());
    }
}
