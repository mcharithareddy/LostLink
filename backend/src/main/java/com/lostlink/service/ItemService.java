package com.lostlink.service;
import org.springframework.transaction.annotation.Transactional;
import com.lostlink.dto.ItemRequest;
import com.lostlink.dto.ItemResponse;
import com.lostlink.entity.Item;
import com.lostlink.entity.User;
import com.lostlink.enums.ItemStatus;
import com.lostlink.enums.ReportType;
import com.lostlink.exception.ForbiddenException;
import com.lostlink.exception.ResourceNotFoundException;
import com.lostlink.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemResponse createItem(ItemRequest request, User owner) {
        Item item = Item.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .reportType(ReportType.valueOf(request.getReportType().toUpperCase()))
                .location(request.getLocation())
                .itemDate(request.getItemDate())
                .imageUrl(request.getImageUrl())
                .status(ItemStatus.OPEN)
                .owner(owner)
                .build();

        return toResponse(itemRepository.save(item));
    }

    public Page<ItemResponse> searchItems(String search, String reportType, String category,
                                           String location, String status,
                                           int page, int size, String sort) {
        Sort sortObj = "oldest".equals(sort)
                ? Sort.by("createdAt").ascending()
                : Sort.by("createdAt").descending();

        Pageable pageable = PageRequest.of(page, size, sortObj);

        ReportType rt = (reportType != null && !reportType.isBlank()) ? ReportType.valueOf(reportType.toUpperCase()) : null;
        ItemStatus st = (status != null && !status.isBlank()) ? ItemStatus.valueOf(status.toUpperCase()) : null;

        return itemRepository.searchItems(search, rt, category, location, st, pageable)
                .map(this::toResponse);
    }

    public ItemResponse getItemById(Long id) {
        return toResponse(findById(id));
    }

    public ItemResponse updateItem(Long id, ItemRequest request, User currentUser) {
        Item item = findById(id);
        checkOwnership(item, currentUser);

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setReportType(ReportType.valueOf(request.getReportType().toUpperCase()));
        item.setLocation(request.getLocation());
        item.setItemDate(request.getItemDate());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());

        return toResponse(itemRepository.save(item));
    }

    public void deleteItem(Long id, User currentUser) {
        Item item = findById(id);

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        if (!isAdmin) {
            checkOwnership(item, currentUser);
            if (!ItemStatus.OPEN.equals(item.getStatus())) {
                throw new ForbiddenException("Cannot delete an item that is not in OPEN status");
            }
        }

        itemRepository.delete(item);
    }

    public List<ItemResponse> getMyItems(User owner) {
        return itemRepository.findByOwner(owner).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ItemResponse> getRecentItems(int limit) {
        return itemRepository.findRecentItems(PageRequest.of(0, limit)).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse updateStatus(Long id, String status, User currentUser) {
        Item item = findById(id);
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        if (!isAdmin) checkOwnership(item, currentUser);
        item.setStatus(ItemStatus.valueOf(status.toUpperCase()));
        return toResponse(itemRepository.save(item));
    }

    // ---- helpers ----

    public Item findById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
    }

    private void checkOwnership(Item item, User user) {
        if (!item.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to modify this item");
        }
    }

    public ItemResponse toResponse(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .reportType(item.getReportType().name())
                .location(item.getLocation())
                .itemDate(item.getItemDate())
                .imageUrl(item.getImageUrl())
                .status(item.getStatus().name())
                .ownerId(item.getOwner().getId())
                .ownerName(item.getOwner().getName())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
