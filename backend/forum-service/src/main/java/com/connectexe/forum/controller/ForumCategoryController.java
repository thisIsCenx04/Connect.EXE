package com.connectexe.forum.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.common.exception.ApiException;
import com.connectexe.forum.domain.entity.ForumCategory;
import com.connectexe.forum.dto.ForumCategoryResponse;
import com.connectexe.forum.service.ForumCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/forum/categories")
public class ForumCategoryController {

    private final ForumCategoryService categoryService;

    public ForumCategoryController(ForumCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ForumCategoryResponse>>> list() {
        List<ForumCategoryResponse> response = categoryService.listCategories();
        return ResponseEntity.ok(ApiResponse.ok("Forum categories loaded", response));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ForumCategoryResponse>> get(@PathVariable("slug") String slug) {
        ForumCategory category = categoryService.resolveBySlug(slug);
        if (category == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found");
        }
        ForumCategoryResponse response = new ForumCategoryResponse(
            category.getId(),
            category.getName(),
            category.getSlug(),
            category.getSortOrder()
        );
        return ResponseEntity.ok(ApiResponse.ok("Forum category loaded", response));
    }
}
