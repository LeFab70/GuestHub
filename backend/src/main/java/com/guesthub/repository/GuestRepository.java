package com.guesthub.repository;

import com.guesthub.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    
    Optional<Guest> findByEmail(String email);
    
    List<Guest> findByCompany(String company);
    
    List<Guest> findByIsBlacklistedTrue();
    
    List<Guest> findByIsBlacklistedFalse();
    
    @Query("SELECT g FROM Guest g WHERE g.firstName LIKE %:name% OR g.lastName LIKE %:name%")
    List<Guest> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT g FROM Guest g WHERE g.idNumber = :idNumber")
    Optional<Guest> findByIdNumber(@Param("idNumber") String idNumber);
}
