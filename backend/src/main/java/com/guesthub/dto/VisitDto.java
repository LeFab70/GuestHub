package com.guesthub.dto;

import com.guesthub.entity.VisitStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class VisitDto {
    
    private Long id;
    
    @NotNull
    private LocalDateTime visitDate;
    
    private Integer expectedDuration;
    
    private Integer actualDuration;
    
    private VisitStatus visitStatus;
    
    @Size(max = 500)
    private String purpose;
    
    @Size(max = 1000)
    private String notes;
    
    private LocalDateTime checkInTime;
    
    private LocalDateTime checkOutTime;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Long guestId;
    
    private String guestName;
    
    private Long hostId;
    
    private String hostName;
    
    private Long createdById;
    
    private String createdByName;
    
    // Constructors
    public VisitDto() {}
    
    public VisitDto(Long id, LocalDateTime visitDate, Integer expectedDuration, 
                    Integer actualDuration, VisitStatus visitStatus, String purpose, 
                    String notes, LocalDateTime checkInTime, LocalDateTime checkOutTime, 
                    LocalDateTime createdAt, LocalDateTime updatedAt, Long guestId, 
                    String guestName, Long hostId, String hostName, Long createdById, 
                    String createdByName) {
        this.id = id;
        this.visitDate = visitDate;
        this.expectedDuration = expectedDuration;
        this.actualDuration = actualDuration;
        this.visitStatus = visitStatus;
        this.purpose = purpose;
        this.notes = notes;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.guestId = guestId;
        this.guestName = guestName;
        this.hostId = hostId;
        this.hostName = hostName;
        this.createdById = createdById;
        this.createdByName = createdByName;
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
    
    public Long getGuestId() {
        return guestId;
    }
    
    public void setGuestId(Long guestId) {
        this.guestId = guestId;
    }
    
    public String getGuestName() {
        return guestName;
    }
    
    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }
    
    public Long getHostId() {
        return hostId;
    }
    
    public void setHostId(Long hostId) {
        this.hostId = hostId;
    }
    
    public String getHostName() {
        return hostName;
    }
    
    public void setHostName(String hostName) {
        this.hostName = hostName;
    }
    
    public Long getCreatedById() {
        return createdById;
    }
    
    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }
    
    public String getCreatedByName() {
        return createdByName;
    }
    
    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
}
