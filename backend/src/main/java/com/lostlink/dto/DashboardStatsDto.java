package com.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsDto {
    private long totalReports;
    private long lostItems;
    private long foundItems;
    private long returnedItems;
    private long totalUsers;
    private long pendingClaims;
}
