package com.guesthub.controller;

import com.guesthub.dto.VisitDto;
import com.guesthub.entity.Visit;
import com.guesthub.entity.VisitStatus;
import com.guesthub.repository.VisitRepository;
import com.guesthub.repository.GuestRepository;
import com.guesthub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "*")
public class VisitController {
    
    @Autowired
    private VisitRepository visitRepository;
    
    @Autowired
    private GuestRepository guestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<VisitDto>> getAllVisits() {
        List<Visit> visits = visitRepository.findAll();
        List<VisitDto> visitDtos = visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitDtos);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<VisitDto> getVisitById(@PathVariable Long id) {
        Optional<Visit> visit = visitRepository.findById(id);
        return visit.map(v -> ResponseEntity.ok(convertToDto(v)))
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/guest/{guestId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<VisitDto>> getVisitsByGuest(@PathVariable Long guestId) {
        List<Visit> visits = visitRepository.findByGuestId(guestId);
        List<VisitDto> visitDtos = visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitDtos);
    }
    
    @GetMapping("/host/{hostId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<VisitDto>> getVisitsByHost(@PathVariable Long hostId) {
        List<Visit> visits = visitRepository.findByHostId(hostId);
        List<VisitDto> visitDtos = visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitDtos);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<VisitDto>> getVisitsByStatus(@PathVariable VisitStatus status) {
        List<Visit> visits = visitRepository.findByVisitStatus(status);
        List<VisitDto> visitDtos = visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitDtos);
    }
    
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<VisitDto>> getVisitsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Visit> visits = visitRepository.findByVisitDateBetween(startDate, endDate);
        List<VisitDto> visitDtos = visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitDtos);
    }
    
    @GetMapping("/guest/{guestId}/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<VisitDto>> getGuestVisitsByDateRange(
            @PathVariable Long guestId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Visit> visits = visitRepository.findByGuestIdAndDateRange(guestId, startDate, endDate);
        List<VisitDto> visitDtos = visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitDtos);
    }
    
    @GetMapping("/host/{hostId}/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<VisitDto>> getHostVisitsByDateRange(
            @PathVariable Long hostId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Visit> visits = visitRepository.findByHostIdAndDateRange(hostId, startDate, endDate);
        List<VisitDto> visitDtos = visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitDtos);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<VisitDto> createVisit(@Valid @RequestBody VisitDto visitDto) {
        Visit visit = convertToEntity(visitDto);
        Visit savedVisit = visitRepository.save(visit);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedVisit));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<VisitDto> updateVisit(@PathVariable Long id, @Valid @RequestBody VisitDto visitDto) {
        Optional<Visit> existingVisit = visitRepository.findById(id);
        if (existingVisit.isPresent()) {
            Visit visit = existingVisit.get();
            updateVisitFromDto(visit, visitDto);
            Visit savedVisit = visitRepository.save(visit);
            return ResponseEntity.ok(convertToDto(savedVisit));
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVisit(@PathVariable Long id) {
        if (visitRepository.existsById(id)) {
            visitRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/check-in")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<VisitDto> checkIn(@PathVariable Long id) {
        Optional<Visit> visit = visitRepository.findById(id);
        if (visit.isPresent()) {
            visit.get().setCheckInTime(LocalDateTime.now());
            visit.get().setVisitStatus(VisitStatus.IN_PROGRESS);
            Visit savedVisit = visitRepository.save(visit.get());
            return ResponseEntity.ok(convertToDto(savedVisit));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/check-out")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<VisitDto> checkOut(@PathVariable Long id) {
        Optional<Visit> visit = visitRepository.findById(id);
        if (visit.isPresent()) {
            visit.get().setCheckOutTime(LocalDateTime.now());
            visit.get().setVisitStatus(VisitStatus.COMPLETED);
            
            // Calculate actual duration
            if (visit.get().getCheckInTime() != null) {
                long duration = java.time.Duration.between(
                    visit.get().getCheckInTime(), 
                    visit.get().getCheckOutTime()
                ).toMinutes();
                visit.get().setActualDuration((int) duration);
            }
            
            Visit savedVisit = visitRepository.save(visit.get());
            return ResponseEntity.ok(convertToDto(savedVisit));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<VisitDto> cancelVisit(@PathVariable Long id) {
        Optional<Visit> visit = visitRepository.findById(id);
        if (visit.isPresent()) {
            visit.get().setVisitStatus(VisitStatus.CANCELLED);
            Visit savedVisit = visitRepository.save(visit.get());
            return ResponseEntity.ok(convertToDto(savedVisit));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/no-show")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<VisitDto> markNoShow(@PathVariable Long id) {
        Optional<Visit> visit = visitRepository.findById(id);
        if (visit.isPresent()) {
            visit.get().setVisitStatus(VisitStatus.NO_SHOW);
            Visit savedVisit = visitRepository.save(visit.get());
            return ResponseEntity.ok(convertToDto(savedVisit));
        }
        return ResponseEntity.notFound().build();
    }
    
    private VisitDto convertToDto(Visit visit) {
        VisitDto dto = new VisitDto();
        dto.setId(visit.getId());
        dto.setVisitDate(visit.getVisitDate());
        dto.setExpectedDuration(visit.getExpectedDuration());
        dto.setActualDuration(visit.getActualDuration());
        dto.setVisitStatus(visit.getVisitStatus());
        dto.setPurpose(visit.getPurpose());
        dto.setNotes(visit.getNotes());
        dto.setCheckInTime(visit.getCheckInTime());
        dto.setCheckOutTime(visit.getCheckOutTime());
        dto.setCreatedAt(visit.getCreatedAt());
        dto.setUpdatedAt(visit.getUpdatedAt());
        
        if (visit.getGuest() != null) {
            dto.setGuestId(visit.getGuest().getId());
            dto.setGuestName(visit.getGuest().getFirstName() + " " + visit.getGuest().getLastName());
        }
        
        if (visit.getHost() != null) {
            dto.setHostId(visit.getHost().getId());
            dto.setHostName(visit.getHost().getFirstName() + " " + visit.getHost().getLastName());
        }
        
        if (visit.getCreatedBy() != null) {
            dto.setCreatedById(visit.getCreatedBy().getId());
            dto.setCreatedByName(visit.getCreatedBy().getFirstName() + " " + visit.getCreatedBy().getLastName());
        }
        
        return dto;
    }
    
    private Visit convertToEntity(VisitDto visitDto) {
        Visit visit = new Visit();
        visit.setVisitDate(visitDto.getVisitDate());
        visit.setExpectedDuration(visitDto.getExpectedDuration());
        visit.setActualDuration(visitDto.getActualDuration());
        visit.setVisitStatus(visitDto.getVisitStatus() != null ? visitDto.getVisitStatus() : VisitStatus.SCHEDULED);
        visit.setPurpose(visitDto.getPurpose());
        visit.setNotes(visitDto.getNotes());
        visit.setCheckInTime(visitDto.getCheckInTime());
        visit.setCheckOutTime(visitDto.getCheckOutTime());
        
        if (visitDto.getGuestId() != null) {
            guestRepository.findById(visitDto.getGuestId()).ifPresent(visit::setGuest);
        }
        
        if (visitDto.getHostId() != null) {
            userRepository.findById(visitDto.getHostId()).ifPresent(visit::setHost);
        }
        
        if (visitDto.getCreatedById() != null) {
            userRepository.findById(visitDto.getCreatedById()).ifPresent(visit::setCreatedBy);
        }
        
        return visit;
    }
    
    private void updateVisitFromDto(Visit visit, VisitDto visitDto) {
        if (visitDto.getVisitDate() != null) {
            visit.setVisitDate(visitDto.getVisitDate());
        }
        if (visitDto.getExpectedDuration() != null) {
            visit.setExpectedDuration(visitDto.getExpectedDuration());
        }
        if (visitDto.getActualDuration() != null) {
            visit.setActualDuration(visitDto.getActualDuration());
        }
        if (visitDto.getVisitStatus() != null) {
            visit.setVisitStatus(visitDto.getVisitStatus());
        }
        if (visitDto.getPurpose() != null) {
            visit.setPurpose(visitDto.getPurpose());
        }
        if (visitDto.getNotes() != null) {
            visit.setNotes(visitDto.getNotes());
        }
        if (visitDto.getCheckInTime() != null) {
            visit.setCheckInTime(visitDto.getCheckInTime());
        }
        if (visitDto.getCheckOutTime() != null) {
            visit.setCheckOutTime(visitDto.getCheckOutTime());
        }
        if (visitDto.getGuestId() != null) {
            guestRepository.findById(visitDto.getGuestId()).ifPresent(visit::setGuest);
        }
        if (visitDto.getHostId() != null) {
            userRepository.findById(visitDto.getHostId()).ifPresent(visit::setHost);
        }
        if (visitDto.getCreatedById() != null) {
            userRepository.findById(visitDto.getCreatedById()).ifPresent(visit::setCreatedBy);
        }
    }
}
