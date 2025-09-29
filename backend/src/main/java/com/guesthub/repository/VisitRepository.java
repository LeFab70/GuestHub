package com.guesthub.repository;

import com.guesthub.entity.Visit;
import com.guesthub.entity.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    
    List<Visit> findByGuestId(Long guestId);
    
    List<Visit> findByHostId(Long hostId);
    
    List<Visit> findByVisitStatus(VisitStatus visitStatus);
    
    List<Visit> findByVisitDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT v FROM Visit v WHERE v.guest.id = :guestId AND v.visitDate >= :startDate AND v.visitDate <= :endDate")
    List<Visit> findByGuestIdAndDateRange(@Param("guestId") Long guestId, 
                                         @Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT v FROM Visit v WHERE v.host.id = :hostId AND v.visitDate >= :startDate AND v.visitDate <= :endDate")
    List<Visit> findByHostIdAndDateRange(@Param("hostId") Long hostId, 
                                        @Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT v FROM Visit v WHERE v.visitStatus = :status AND v.visitDate >= :startDate AND v.visitDate <= :endDate")
    List<Visit> findByStatusAndDateRange(@Param("status") VisitStatus status, 
                                        @Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
}
