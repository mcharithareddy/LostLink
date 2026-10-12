package com.lostlink.controller;

import com.lostlink.dto.ClaimRequest;
import com.lostlink.dto.ClaimResponse;
import com.lostlink.entity.User;
import com.lostlink.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping
    public ResponseEntity<ClaimResponse> submitClaim(@Valid @RequestBody ClaimRequest request,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(claimService.submitClaim(request, user));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.getMyClaims(user));
    }

    @GetMapping("/received")
    public ResponseEntity<List<ClaimResponse>> getReceivedClaims(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.getClaimsForMyItems(user));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ClaimResponse>> getClaimsForItem(@PathVariable Long itemId,
                                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.getClaimsForItem(itemId, user));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<ClaimResponse> reviewClaim(@PathVariable Long id,
                                                      @RequestParam String action,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.reviewClaim(id, action, user));
    }
}
