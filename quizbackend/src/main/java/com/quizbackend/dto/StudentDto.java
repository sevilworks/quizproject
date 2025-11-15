package com.quizbackend.dto;

public class StudentDto {
    private Integer userId;
    private String firstName;
    private String lastName;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public static StudentDto fromEntity(com.quizbackend.entity.Student student) {
        StudentDto dto = new StudentDto();
        dto.setUserId(student.getUser().getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        return dto;
    }
}