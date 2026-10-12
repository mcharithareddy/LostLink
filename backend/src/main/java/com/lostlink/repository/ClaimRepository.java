package com.lostlink.repository;

import com.lostlink.entity.Claim;
import com.lostlink.entity.Item;
import com.lostlink.entity.User;
import com.lostlink.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByClaimant(User claimant);

    List<Claim> findByItem(Item item);

    boolean existsByItemAndClaimantAndStatusIn(Item item, User claimant, List<ClaimStatus> statuses);

    long countByStatus(ClaimStatus status);

    @Query("SELECT c FROM Claim c WHERE c.item.owner = :owner")
    List<Claim> findClaimsForOwnerItems(@Param("owner") User owner);

    Optional<Claim> findByIdAndClaimant(Long id, User claimant);

    Optional<Claim> findByIdAndItemOwner(Long id, User owner);
}
