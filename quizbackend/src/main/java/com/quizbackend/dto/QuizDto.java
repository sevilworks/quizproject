package com.quizbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class QuizDto {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @Positive(message = "Duration must be positive")
    private Integer duration;
    
    private List<QuestionDto> questions;
    
    @Data
    public static class QuestionDto {
        @NotBlank(message = "Question text is required")
        private String questionText;
        
        private List<ResponseDto> responses;
    }
    
    @Data
    public static class ResponseDto {
        @NotBlank(message = "Response text is required")
        private String responseText;
        
        @NotNull(message = "Is correct flag is required")
        private Boolean isCorrect;
    }
}
