package com.firstteam.taskbountyplatform.admin.dto;

import java.time.LocalDateTime;

public class AdminTaskDTO {
    private Long id;
    private String title;
    private String description;
    private Long publisherId;
    private String publisherNickname;
    private Long winnerId;
    private String winnerNickname;
    private Long categoryId;
    private String categoryName;
    private String campus;
    private Integer rewardPoints;
    private Integer deadlineMinutes;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime awardedAt;
    private LocalDateTime deadlineAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private Integer reward;
    private String stayDuration;

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public Long getPublisherId() { return publisherId; }
    public void setPublisherId(Long v) { this.publisherId = v; }
    public String getPublisherNickname() { return publisherNickname; }
    public void setPublisherNickname(String v) { this.publisherNickname = v; }
    public Long getWinnerId() { return winnerId; }
    public void setWinnerId(Long v) { this.winnerId = v; }
    public String getWinnerNickname() { return winnerNickname; }
    public void setWinnerNickname(String v) { this.winnerNickname = v; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long v) { this.categoryId = v; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String v) { this.categoryName = v; }
    public String getCampus() { return campus; }
    public void setCampus(String v) { this.campus = v; }
    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer v) { this.rewardPoints = v; }
    public Integer getDeadlineMinutes() { return deadlineMinutes; }
    public void setDeadlineMinutes(Integer v) { this.deadlineMinutes = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime v) { this.publishedAt = v; }
    public LocalDateTime getAwardedAt() { return awardedAt; }
    public void setAwardedAt(LocalDateTime v) { this.awardedAt = v; }
    public LocalDateTime getDeadlineAt() { return deadlineAt; }
    public void setDeadlineAt(LocalDateTime v) { this.deadlineAt = v; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime v) { this.completedAt = v; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime v) { this.cancelledAt = v; }
    public Integer getReward() { return reward; }
    public void setReward(Integer v) { this.reward = v; }
    public String getStayDuration() { return stayDuration; }
    public void setStayDuration(String v) { this.stayDuration = v; }
}
