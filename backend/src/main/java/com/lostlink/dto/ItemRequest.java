package com.lostlink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ItemRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Report type is required")
    private String reportType; // LOST or FOUND

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Date is required")
    private LocalDate itemDate;

    private String imageUrl;
}
