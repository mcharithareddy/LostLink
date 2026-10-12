
package com.lostlink.service;

import com.lostlink.dto.ClaimRequest;
import com.lostlink.dto.ClaimResponse;
import com.lostlink.entity.Claim;
import com.lostlink.entity.Item;
import com.lostlink.entity.User;
import com.lostlink.enums.ClaimStatus;
import com.lostlink.enums.ItemStatus;
import com.lostlink.exception.BadRequestException;
import com.lostlink.exception.ForbiddenException;
import com.lostlink.exception.ResourceNotFoundException;
import com.lostlink.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemService itemService;

    @Transactional
    public ClaimResponse submitClaim(ClaimRequest request, User claimant) {
        Item item = itemService.findById(request.getItemId());

        // Only FOUND items can be claimed
        if (!"FOUND".equals(item.getReportType().name())) {
            throw new BadRequestException(
                    "You can only claim FOUND items"
            );
        }

        // Cannot claim your own item
        if (item.getOwner().getId().equals(claimant.getId())) {
            throw new BadRequestException(
                    "You cannot claim your own reported item"
            );
        }

        // Item must be OPEN
        if (!ItemStatus.OPEN.equals(item.getStatus())) {
            throw new BadRequestException(
                    "This item is no longer available for claims"
            );
        }

        // Prevent duplicate active claims
        boolean hasPending =
                claimRepository.existsByItemAndClaimantAndStatusIn(
                        item,
                        claimant,
                        List.of(
                                ClaimStatus.PENDING,
                                ClaimStatus.APPROVED
                        )
                );

        if (hasPending) {
            throw new BadRequestException(
                    "You already have an active claim for this item"
            );
        }

        Claim claim = Claim.builder()
                .item(item)
                .claimant(claimant)
                .claimDescription(request.getClaimDescription())
                .status(ClaimStatus.PENDING)
                .build();

        // Mark item as MATCHED when a claim is submitted
        item.setStatus(ItemStatus.MATCHED);

        Claim savedClaim = claimRepository.save(claim);

        return toResponse(savedClaim);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getMyClaims(User user) {
        return claimRepository.findByClaimant(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsForMyItems(User owner) {
        return claimRepository.findClaimsForOwnerItems(owner)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClaimResponse reviewClaim(
            Long claimId,
            String action,
            User reviewer
    ) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Claim not found: " + claimId
                        )
                );

        Item item = claim.getItem();

        boolean isAdmin =
                reviewer.getRole().name().equals("ADMIN");

        boolean isItemOwner =
                item.getOwner().getId().equals(reviewer.getId());

        if (!isAdmin && !isItemOwner) {
            throw new ForbiddenException(
                    "Only the item reporter or admin can review claims"
            );
        }

        // Claimant cannot review their own claim
        if (claim.getClaimant().getId().equals(reviewer.getId())) {
            throw new ForbiddenException(
                    "You cannot approve your own claim"
            );
        }

        if (!ClaimStatus.PENDING.equals(claim.getStatus())) {
            throw new BadRequestException(
                    "Claim is already reviewed"
            );
        }

        if ("approve".equalsIgnoreCase(action)) {
            claim.setStatus(ClaimStatus.APPROVED);
            claim.setReviewedBy(reviewer);
            item.setStatus(ItemStatus.RETURNED);

        } else if ("reject".equalsIgnoreCase(action)) {
            claim.setStatus(ClaimStatus.REJECTED);
            claim.setReviewedBy(reviewer);

            // Reopen the item if no other pending claims remain
            long pendingCount = claimRepository.findByItem(item)
                    .stream()
                    .filter(c ->
                            ClaimStatus.PENDING.equals(c.getStatus())
                                    && !c.getId().equals(claimId)
                    )
                    .count();

            if (pendingCount == 0) {
                item.setStatus(ItemStatus.OPEN);
            }

        } else {
            throw new BadRequestException(
                    "Invalid action. Use 'approve' or 'reject'"
            );
        }

        return toResponse(claimRepository.save(claim));
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
@Transactional(readOnly = true)
public List<ClaimResponse> getClaimsForItem(Long itemId, User user) {
    return claimRepository.findClaimsForOwnerItems(user)
            .stream()
            .filter(claim -> claim.getItem().getId().equals(itemId))
            .map(this::toResponse)
            .collect(Collectors.toList());
}


    private ClaimResponse toResponse(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .itemId(claim.getItem().getId())
                .itemTitle(claim.getItem().getTitle())
                .itemCategory(claim.getItem().getCategory())
                .itemReportType(
                        claim.getItem().getReportType().name()
                )
                .claimantId(claim.getClaimant().getId())
                .claimantName(claim.getClaimant().getName())
                .claimDescription(claim.getClaimDescription())
                .status(claim.getStatus().name())
                .reviewedByName(
                        claim.getReviewedBy() != null
                                ? claim.getReviewedBy().getName()
                                : null
                )
                .createdAt(claim.getCreatedAt())
                .updatedAt(claim.getUpdatedAt())
                .build();
    }
}
