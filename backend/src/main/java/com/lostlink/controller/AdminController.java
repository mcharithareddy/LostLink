package com.lostlink.controller;

import com.lostlink.dto.ClaimResponse;
import com.lostlink.dto.DashboardStatsDto;
import com.lostlink.dto.ItemResponse;
import com.lostlink.dto.UserResponse;
import com.lostlink.entity.User;
import com.lostlink.service.AdminService;
import com.lostlink.service.ClaimService;
import com.lostlink.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ItemService itemService;
    private final ClaimService claimService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/promote")
    public ResponseEntity<UserResponse> promoteUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.promoteToAdmin(id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/items")
    public ResponseEntity<List<ItemResponse>> getAllItems() {
        return ResponseEntity.ok(itemService.getRecentItems(1000));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, @AuthenticationPrincipal User user) {
        itemService.deleteItem(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/claims")
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @PatchMapping("/claims/{id}/review")
    public ResponseEntity<ClaimResponse> reviewClaim(@PathVariable Long id,
                                                      @RequestParam String action,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.reviewClaim(id, action, user));
    }
}
