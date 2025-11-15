package com.quizbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SubmitQuizRequest {
    @JsonProperty("selectedResponseIds")
    private List<Integer> selectedResponseIds; // Main field for response IDs
    private Integer guestId;
    private String studentResponses; // Store individual responses as JSON string

    // Getters and setters
    public List<Integer> getSelectedResponseIds() {
        return selectedResponseIds;
    }

    public void setSelectedResponseIds(List<Integer> selectedResponseIds) {
        this.selectedResponseIds = selectedResponseIds;
    }

    public Integer getGuestId() {
        return guestId;
    }

    public void setGuestId(Integer guestId) {
        this.guestId = guestId;
    }

    public String getStudentResponses() {
        return studentResponses;
    }

    public void setStudentResponses(String studentResponses) {
        this.studentResponses = studentResponses;
    }
}