package com.lostlink.service;

import com.lostlink.dto.DashboardStatsDto;
import com.lostlink.dto.UserResponse;
import com.lostlink.entity.User;
import com.lostlink.enums.ClaimStatus;
import com.lostlink.enums.ItemStatus;
import com.lostlink.enums.ReportType;
import com.lostlink.enums.Role;
import com.lostlink.exception.BadRequestException;
import com.lostlink.exception.ResourceNotFoundException;
import com.lostlink.repository.ClaimRepository;
import com.lostlink.repository.ItemRepository;
import com.lostlink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;

    public DashboardStatsDto getStats() {
        return DashboardStatsDto.builder()
                .totalReports(itemRepository.count())
                .lostItems(itemRepository.countByReportType(ReportType.LOST))
                .foundItems(itemRepository.countByReportType(ReportType.FOUND))
                .returnedItems(itemRepository.countByStatus(ItemStatus.RETURNED))
                .totalUsers(userRepository.count())
                .pendingClaims(claimRepository.countByStatus(ClaimStatus.PENDING))
                .build();
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public UserResponse promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(Role.ADMIN);
        user = userRepository.save(user);
        return UserResponse.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .role(user.getRole().name()).createdAt(user.getCreatedAt()).build();
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (Role.ADMIN.equals(user.getRole())) {
            throw new BadRequestException("Cannot delete an admin user");
        }
        userRepository.delete(user);
    }
}
