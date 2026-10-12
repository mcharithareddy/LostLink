package com.lostlink.repository;

import com.lostlink.entity.Item;
import com.lostlink.entity.User;
import com.lostlink.enums.ItemStatus;
import com.lostlink.enums.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByOwner(User owner);

    long countByReportType(ReportType reportType);

    long countByStatus(ItemStatus status);

    @Query("SELECT i FROM Item i WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:reportType IS NULL OR i.reportType = :reportType) AND " +
           "(:category IS NULL OR :category = '' OR LOWER(i.category) = LOWER(:category)) AND " +
           "(:location IS NULL OR :location = '' OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:status IS NULL OR i.status = :status)")
    Page<Item> searchItems(
            @Param("search") String search,
            @Param("reportType") ReportType reportType,
            @Param("category") String category,
            @Param("location") String location,
            @Param("status") ItemStatus status,
            Pageable pageable
    );

    @Query("SELECT i FROM Item i ORDER BY i.createdAt DESC")
    List<Item> findRecentItems(Pageable pageable);
}
