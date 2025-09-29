package com.guesthub.dto;

import com.guesthub.entity.IdType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class GuestDto {
    
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String firstName;
    
    @NotBlank
    @Size(max = 100)
    private String lastName;
    
    @Email
    @NotBlank
    @Size(max = 255)
    private String email;
    
    @NotBlank
    @Size(max = 20)
    private String phoneNumber;
    
    @Size(max = 100)
    private String company;
    
    @Size(max = 100)
    private String position;
    
    private String idNumber;
    
    private IdType idType;
    
    private Boolean isBlacklisted;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Constructors
    public GuestDto() {}
    
    public GuestDto(Long id, String firstName, String lastName, String email, 
                    String phoneNumber, String company, String position, 
                    String idNumber, IdType idType, Boolean isBlacklisted, 
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.company = company;
        this.position = position;
        this.idNumber = idNumber;
        this.idType = idType;
        this.isBlacklisted = isBlacklisted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    public String getPosition() {
        return position;
    }
    
    public void setPosition(String position) {
        this.position = position;
    }
    
    public String getIdNumber() {
        return idNumber;
    }
    
    public void setIdNumber(String idNumber) {
        this.idNumber = idNumber;
    }
    
    public IdType getIdType() {
        return idType;
    }
    
    public void setIdType(IdType idType) {
        this.idType = idType;
    }
    
    public Boolean getIsBlacklisted() {
        return isBlacklisted;
    }
    
    public void setIsBlacklisted(Boolean isBlacklisted) {
        this.isBlacklisted = isBlacklisted;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
