package com.quizbackend.controller;

import com.quizbackend.entity.Guest;
import com.quizbackend.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/quiz/guest")
@CrossOrigin(origins = "*")
public class GuestController {

    @Autowired
    private GuestService guestService;

    @PostMapping("/create")
    public ResponseEntity<?> createGuest(@RequestBody GuestRequest request) {
        try {
            Guest guest = guestService.createGuest(request.getPseudo(), request.getEmail());
            return ResponseEntity.ok(guest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{guestId}")
    public ResponseEntity<?> getGuest(@PathVariable Integer guestId) {
        try {
            Guest guest = guestService.getGuestById(guestId);
            return ResponseEntity.ok(guest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request DTOs
    public static class GuestRequest {
        private String pseudo;
        private String email;

        public String getPseudo() { return pseudo; }
        public void setPseudo(String pseudo) { this.pseudo = pseudo; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
