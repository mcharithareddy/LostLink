package com.lostlink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClaimRequest {
    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotBlank(message = "Claim description is required")
    private String claimDescription;
}
