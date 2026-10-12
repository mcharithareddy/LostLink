package com.lostlink.controller;

import com.lostlink.dto.DashboardStatsDto;
import com.lostlink.dto.ItemRequest;
import com.lostlink.dto.ItemResponse;
import com.lostlink.entity.User;
import com.lostlink.service.AdminService;
import com.lostlink.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<Page<ItemResponse>> searchItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(itemService.searchItems(search, reportType, category, location, status, page, size, sort));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ItemResponse>> getRecentItems(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(itemService.getRecentItems(limit));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PostMapping
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody ItemRequest request,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(itemService.createItem(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(@PathVariable Long id,
                                                    @Valid @RequestBody ItemRequest request,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(itemService.updateItem(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id,
                                            @AuthenticationPrincipal User user) {
        itemService.deleteItem(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemResponse>> getMyItems(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(itemService.getMyItems(user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ItemResponse> updateStatus(@PathVariable Long id,
                                                      @RequestParam String status,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(itemService.updateStatus(id, status, user));
    }
}
