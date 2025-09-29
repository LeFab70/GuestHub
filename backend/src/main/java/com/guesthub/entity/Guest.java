package com.guesthub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "guests")
public class Guest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "first_name")
    private String firstName;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "last_name")
    private String lastName;
    
    @Email
    @NotBlank
    @Size(max = 255)
    @Column(unique = true)
    private String email;
    
    @NotBlank
    @Size(max = 20)
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Size(max = 100)
    private String company;
    
    @Size(max = 100)
    private String position;
    
    @Column(name = "id_number")
    private String idNumber;
    
    @Column(name = "id_type")
    @Enumerated(EnumType.STRING)
    private IdType idType;
    
    @Column(name = "is_blacklisted")
    private Boolean isBlacklisted = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "guest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Visit> visits;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Guest() {}
    
    public Guest(String firstName, String lastName, String email, String phoneNumber, 
                 String company, String position, String idNumber, IdType idType) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.company = company;
        this.position = position;
        this.idNumber = idNumber;
        this.idType = idType;
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
    
    public List<Visit> getVisits() {
        return visits;
    }
    
    public void setVisits(List<Visit> visits) {
        this.visits = visits;
    }
}
