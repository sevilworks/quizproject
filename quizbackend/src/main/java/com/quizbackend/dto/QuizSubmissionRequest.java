package com.quizbackend.dto;

import java.util.List;

public class QuizSubmissionRequest {
    private List<Integer> ids;
    private Integer guestId;

    // Getters and setters
    public List<Integer> getIds() {
        return ids;
    }

    public void setIds(List<Integer> ids) {
        this.ids = ids;
    }

    public Integer getGuestId() {
        return guestId;
    }

    public void setGuestId(Integer guestId) {
        this.guestId = guestId;
    }
}