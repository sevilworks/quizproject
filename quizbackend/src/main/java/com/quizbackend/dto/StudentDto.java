package com.quizbackend.dto;

public class StudentDto {
    private Integer userId;
    private String firstName;
    private String lastName;
    private String email; // Added email field

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; } // Added getter
    public void setEmail(String email) { this.email = email; } // Added setter

    public static StudentDto fromEntity(com.quizbackend.entity.Student student) {
        StudentDto dto = new StudentDto();
        dto.setUserId(student.getUser().getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getUser().getEmail()); // Added email from user relationship
        return dto;
    }
}