package com.firstteam.taskbountyplatform.task.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class TaskCardDTO {
    private Long id;
    private String title;
    private Long categoryId;
    private String categoryName;
    private String campus;

    @JsonProperty("reward")
    private Integer rewardPoints;

    private Integer deadlineMinutes;
    private String status;
    private Long publisherId;
    private String publisherNickname;
    private Integer publisherCreditScore;

    @JsonProperty("remainingListTime")
    private String remainingTime;

    private LocalDateTime deadlineAt;
    private LocalDateTime publishedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getCampus() { return campus; }
    public void setCampus(String campus) { this.campus = campus; }
    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer rewardPoints) { this.rewardPoints = rewardPoints; }
    public Integer getDeadlineMinutes() { return deadlineMinutes; }
    public void setDeadlineMinutes(Integer deadlineMinutes) { this.deadlineMinutes = deadlineMinutes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getPublisherId() { return publisherId; }
    public void setPublisherId(Long publisherId) { this.publisherId = publisherId; }
    public String getPublisherNickname() { return publisherNickname; }
    public void setPublisherNickname(String publisherNickname) { this.publisherNickname = publisherNickname; }
    public Integer getPublisherCreditScore() { return publisherCreditScore; }
    public void setPublisherCreditScore(Integer publisherCreditScore) { this.publisherCreditScore = publisherCreditScore; }
    public String getRemainingTime() { return remainingTime; }
    public void setRemainingTime(String remainingTime) { this.remainingTime = remainingTime; }
    public LocalDateTime getDeadlineAt() { return deadlineAt; }
    public void setDeadlineAt(LocalDateTime deadlineAt) { this.deadlineAt = deadlineAt; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
}
