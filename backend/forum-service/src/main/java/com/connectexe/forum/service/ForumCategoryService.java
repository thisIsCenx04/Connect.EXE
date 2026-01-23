package com.connectexe.forum.service;

import com.connectexe.forum.domain.entity.ForumCategory;
import com.connectexe.forum.dto.ForumCategoryResponse;
import com.connectexe.forum.repository.ForumCategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
public class ForumCategoryService {

    private static final List<DefaultCategory> DEFAULT_CATEGORIES = List.of(
        new DefaultCategory("Tin Tuc", "tin-tuc", 1),
        new DefaultCategory("Bai Dang Moi", "bai-dang-moi", 2),
        new DefaultCategory("Hoi Dap & Tu Van", "hoi-dap-tu-van", 3),
        new DefaultCategory("Tim Kiem Nhom & Thanh Vien", "tim-kiem-nhom-thanh-vien", 4),
        new DefaultCategory("Hoc Lieu & Templates", "hoc-lieu-templates", 5),
        new DefaultCategory("Ky Nang & Hoc Tap", "ky-nang-hoc-tap", 6)
    );

    private final ForumCategoryRepository categoryRepository;
    private final AtomicBoolean seeded = new AtomicBoolean(false);

    public ForumCategoryService(ForumCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<ForumCategoryResponse> listCategories() {
        ensureDefaults();
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder")).stream()
            .map(category -> new ForumCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getSortOrder()
            ))
            .toList();
    }

    public ForumCategory resolveBySlug(String slug) {
        ensureDefaults();
        return categoryRepository.findBySlug(slug).orElse(null);
    }

    public ForumCategory resolveById(java.util.UUID id) {
        ensureDefaults();
        return categoryRepository.findById(id).orElse(null);
    }

    private void ensureDefaults() {
        if (seeded.get()) {
            return;
        }
        List<ForumCategory> existing = categoryRepository.findAll();
        Map<String, ForumCategory> bySlug = existing.stream()
            .collect(Collectors.toMap(ForumCategory::getSlug, category -> category, (left, right) -> left));
        Map<String, ForumCategory> byName = existing.stream()
            .collect(Collectors.toMap(ForumCategory::getName, category -> category, (left, right) -> left));
        List<ForumCategory> toSave = new ArrayList<>();
        for (DefaultCategory def : DEFAULT_CATEGORIES) {
            ForumCategory bySlugCategory = bySlug.get(def.slug());
            if (bySlugCategory != null) {
                if (!def.name().equals(bySlugCategory.getName())
                    || bySlugCategory.getSortOrder() != def.sortOrder()) {
                    bySlugCategory.setName(def.name());
                    bySlugCategory.setSortOrder(def.sortOrder());
                    toSave.add(bySlugCategory);
                }
                continue;
            }
            ForumCategory byNameCategory = byName.get(def.name());
            if (byNameCategory != null) {
                if (!def.slug().equals(byNameCategory.getSlug())
                    || byNameCategory.getSortOrder() != def.sortOrder()) {
                    byNameCategory.setSlug(def.slug());
                    byNameCategory.setSortOrder(def.sortOrder());
                    toSave.add(byNameCategory);
                }
                continue;
            }
            ForumCategory category = new ForumCategory();
            category.setName(def.name());
            category.setSlug(def.slug());
            category.setSortOrder(def.sortOrder());
            toSave.add(category);
        }
        if (!toSave.isEmpty()) {
            categoryRepository.saveAll(toSave);
        }
        seeded.set(true);
    }

    private record DefaultCategory(String name, String slug, int sortOrder) {}
}
