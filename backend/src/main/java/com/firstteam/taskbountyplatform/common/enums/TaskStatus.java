package com.firstteam.taskbountyplatform.common.enums;

/**
 * 任务状态枚举
 * 发布中 → 进行中 → 待确认 → 已完成/已取消
 * 可转入申诉中
 */
public enum TaskStatus {
    PUBLISHED("发布中"),
    IN_PROGRESS("进行中"),
    PENDING_CONFIRMATION("待确认"),
    COMPLETED("已完成"),
    CANCELLED("已取消"),
    APPEALING("申诉中");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * 检查是否允许转换到目标状态
     */
    /**
     * Accept frontend-compatible status name (PUBLISHING or PUBLISHED, etc.)
     */
    public static TaskStatus fromName(String name) {
        if (name == null) throw new IllegalArgumentException("状态不能为空");
        String upper = name.toUpperCase();
        // Accept frontend names
        if ("PUBLISHING".equals(upper)) return PUBLISHED;
        if ("PENDING_CONFIRM".equals(upper)) return PENDING_CONFIRMATION;
        return valueOf(upper);
    }

    public boolean canTransitionTo(TaskStatus target) {
        return switch (this) {
            case PUBLISHED -> target == IN_PROGRESS || target == CANCELLED;
            case IN_PROGRESS -> target == PENDING_CONFIRMATION || target == CANCELLED || target == APPEALING;
            case PENDING_CONFIRMATION -> target == COMPLETED || target == IN_PROGRESS || target == APPEALING;
            case APPEALING -> target == COMPLETED || target == CANCELLED || target == IN_PROGRESS;
            case COMPLETED, CANCELLED -> false;
        };
    }
}
