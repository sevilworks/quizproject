package com.quizbackend.service;

import com.quizbackend.entity.Admin;
import com.quizbackend.entity.User;
import com.quizbackend.repository.AdminRepository;
import com.quizbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    public Admin createAdmin(User user, String firstName, String lastName) {
        Admin admin = new Admin();
        admin.setUserId(user.getId());
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        
        return adminRepository.save(admin);
    }

    public Admin getAdminById(Integer id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    public Admin updateAdmin(Integer id, String firstName, String lastName) {
        Admin admin = getAdminById(id);
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        return adminRepository.save(admin);
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
}
