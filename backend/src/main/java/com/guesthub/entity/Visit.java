package com.guesthub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "visits")
public class Visit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "visit_date")
    private LocalDateTime visitDate;
    
    @Column(name = "expected_duration")
    private Integer expectedDuration; // in minutes
    
    @Column(name = "actual_duration")
    private Integer actualDuration; // in minutes
    
    @Enumerated(EnumType.STRING)
    @Column(name = "visit_status")
    private VisitStatus visitStatus;
    
    @Size(max = 500)
    @Column(name = "purpose")
    private String purpose;
    
    @Size(max = 1000)
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;
    
    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @OneToMany(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VisitDocument> documents;
    
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
    public Visit() {}
    
    public Visit(LocalDateTime visitDate, Integer expectedDuration, String purpose, 
                 Guest guest, User host, User createdBy) {
        this.visitDate = visitDate;
        this.expectedDuration = expectedDuration;
        this.purpose = purpose;
        this.guest = guest;
        this.host = host;
        this.createdBy = createdBy;
        this.visitStatus = VisitStatus.SCHEDULED;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getVisitDate() {
        return visitDate;
    }
    
    public void setVisitDate(LocalDateTime visitDate) {
        this.visitDate = visitDate;
    }
    
    public Integer getExpectedDuration() {
        return expectedDuration;
    }
    
    public void setExpectedDuration(Integer expectedDuration) {
        this.expectedDuration = expectedDuration;
    }
    
    public Integer getActualDuration() {
        return actualDuration;
    }
    
    public void setActualDuration(Integer actualDuration) {
        this.actualDuration = actualDuration;
    }
    
    public VisitStatus getVisitStatus() {
        return visitStatus;
    }
    
    public void setVisitStatus(VisitStatus visitStatus) {
        this.visitStatus = visitStatus;
    }
    
    public String getPurpose() {
        return purpose;
    }
    
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }
    
    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }
    
    public LocalDateTime getCheckOutTime() {
        return checkOutTime;
    }
    
    public void setCheckOutTime(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
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
    
    public Guest getGuest() {
        return guest;
    }
    
    public void setGuest(Guest guest) {
        this.guest = guest;
    }
    
    public User getHost() {
        return host;
    }
    
    public void setHost(User host) {
        this.host = host;
    }
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    public List<VisitDocument> getDocuments() {
        return documents;
    }
    
    public void setDocuments(List<VisitDocument> documents) {
        this.documents = documents;
    }
}
