package com.guesthub.controller;

import com.guesthub.dto.GuestDto;
import com.guesthub.entity.Guest;
import com.guesthub.entity.IdType;
import com.guesthub.repository.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = "*")
public class GuestController {
    
    @Autowired
    private GuestRepository guestRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<GuestDto>> getAllGuests() {
        List<Guest> guests = guestRepository.findAll();
        List<GuestDto> guestDtos = guests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(guestDtos);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<GuestDto> getGuestById(@PathVariable Long id) {
        Optional<Guest> guest = guestRepository.findById(id);
        return guest.map(g -> ResponseEntity.ok(convertToDto(g)))
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<GuestDto> getGuestByEmail(@PathVariable String email) {
        Optional<Guest> guest = guestRepository.findByEmail(email);
        return guest.map(g -> ResponseEntity.ok(convertToDto(g)))
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/company/{company}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<GuestDto>> getGuestsByCompany(@PathVariable String company) {
        List<Guest> guests = guestRepository.findByCompany(company);
        List<GuestDto> guestDtos = guests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(guestDtos);
    }
    
    @GetMapping("/blacklisted")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<GuestDto>> getBlacklistedGuests() {
        List<Guest> guests = guestRepository.findByIsBlacklistedTrue();
        List<GuestDto> guestDtos = guests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(guestDtos);
    }
    
    @GetMapping("/not-blacklisted")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<GuestDto>> getNotBlacklistedGuests() {
        List<Guest> guests = guestRepository.findByIsBlacklistedFalse();
        List<GuestDto> guestDtos = guests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(guestDtos);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<List<GuestDto>> searchGuests(@RequestParam String name) {
        List<Guest> guests = guestRepository.findByNameContaining(name);
        List<GuestDto> guestDtos = guests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(guestDtos);
    }
    
    @GetMapping("/id-number/{idNumber}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('MANAGER')")
    public ResponseEntity<GuestDto> getGuestByIdNumber(@PathVariable String idNumber) {
        Optional<Guest> guest = guestRepository.findByIdNumber(idNumber);
        return guest.map(g -> ResponseEntity.ok(convertToDto(g)))
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<GuestDto> createGuest(@Valid @RequestBody GuestDto guestDto) {
        Guest guest = convertToEntity(guestDto);
        Guest savedGuest = guestRepository.save(guest);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedGuest));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<GuestDto> updateGuest(@PathVariable Long id, @Valid @RequestBody GuestDto guestDto) {
        Optional<Guest> existingGuest = guestRepository.findById(id);
        if (existingGuest.isPresent()) {
            Guest guest = existingGuest.get();
            updateGuestFromDto(guest, guestDto);
            Guest savedGuest = guestRepository.save(guest);
            return ResponseEntity.ok(convertToDto(savedGuest));
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGuest(@PathVariable Long id) {
        if (guestRepository.existsById(id)) {
            guestRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/blacklist")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<GuestDto> blacklistGuest(@PathVariable Long id) {
        Optional<Guest> guest = guestRepository.findById(id);
        if (guest.isPresent()) {
            guest.get().setIsBlacklisted(true);
            Guest savedGuest = guestRepository.save(guest.get());
            return ResponseEntity.ok(convertToDto(savedGuest));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/unblacklist")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<GuestDto> unblacklistGuest(@PathVariable Long id) {
        Optional<Guest> guest = guestRepository.findById(id);
        if (guest.isPresent()) {
            guest.get().setIsBlacklisted(false);
            Guest savedGuest = guestRepository.save(guest.get());
            return ResponseEntity.ok(convertToDto(savedGuest));
        }
        return ResponseEntity.notFound().build();
    }
    
    private GuestDto convertToDto(Guest guest) {
        return new GuestDto(
                guest.getId(),
                guest.getFirstName(),
                guest.getLastName(),
                guest.getEmail(),
                guest.getPhoneNumber(),
                guest.getCompany(),
                guest.getPosition(),
                guest.getIdNumber(),
                guest.getIdType(),
                guest.getIsBlacklisted(),
                guest.getCreatedAt(),
                guest.getUpdatedAt()
        );
    }
    
    private Guest convertToEntity(GuestDto guestDto) {
        Guest guest = new Guest();
        guest.setFirstName(guestDto.getFirstName());
        guest.setLastName(guestDto.getLastName());
        guest.setEmail(guestDto.getEmail());
        guest.setPhoneNumber(guestDto.getPhoneNumber());
        guest.setCompany(guestDto.getCompany());
        guest.setPosition(guestDto.getPosition());
        guest.setIdNumber(guestDto.getIdNumber());
        guest.setIdType(guestDto.getIdType());
        guest.setIsBlacklisted(guestDto.getIsBlacklisted() != null ? guestDto.getIsBlacklisted() : false);
        return guest;
    }
    
    private void updateGuestFromDto(Guest guest, GuestDto guestDto) {
        if (guestDto.getFirstName() != null) {
            guest.setFirstName(guestDto.getFirstName());
        }
        if (guestDto.getLastName() != null) {
            guest.setLastName(guestDto.getLastName());
        }
        if (guestDto.getEmail() != null) {
            guest.setEmail(guestDto.getEmail());
        }
        if (guestDto.getPhoneNumber() != null) {
            guest.setPhoneNumber(guestDto.getPhoneNumber());
        }
        if (guestDto.getCompany() != null) {
            guest.setCompany(guestDto.getCompany());
        }
        if (guestDto.getPosition() != null) {
            guest.setPosition(guestDto.getPosition());
        }
        if (guestDto.getIdNumber() != null) {
            guest.setIdNumber(guestDto.getIdNumber());
        }
        if (guestDto.getIdType() != null) {
            guest.setIdType(guestDto.getIdType());
        }
        if (guestDto.getIsBlacklisted() != null) {
            guest.setIsBlacklisted(guestDto.getIsBlacklisted());
        }
    }
}
