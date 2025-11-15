package com.quizbackend.service;

import com.quizbackend.entity.Guest;
import com.quizbackend.repository.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class GuestService {

    @Autowired
    private GuestRepository guestRepository;

    public Guest createGuest(String pseudo, String email) {
        Guest guest = new Guest();
        guest.setPseudo(pseudo);
        guest.setEmail(email);
        return guestRepository.save(guest);
    }

    public Guest getGuestById(Integer id) {
        return guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found"));
    }

    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }
}
