package com.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ItemResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String reportType;
    private String location;
    private LocalDate itemDate;
    private String imageUrl;
    private String status;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
