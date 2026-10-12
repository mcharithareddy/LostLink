package com.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ClaimResponse {
    private Long id;
    private Long itemId;
    private String itemTitle;
    private String itemCategory;
    private String itemReportType;
    private Long claimantId;
    private String claimantName;
    private String claimDescription;
    private String status;
    private String reviewedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
