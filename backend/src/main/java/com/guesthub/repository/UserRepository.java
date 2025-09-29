package com.guesthub.repository;

import com.guesthub.entity.User;
import com.guesthub.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    List<User> findByUserRole(UserRole userRole);
    
    List<User> findByDepartment(String department);
    
    List<User> findByIsActiveTrue();
    
    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:name% OR u.lastName LIKE %:name%")
    List<User> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT u FROM User u WHERE u.department = :department AND u.isActive = true")
    List<User> findActiveUsersByDepartment(@Param("department") String department);
}
