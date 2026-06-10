package com.firstteam.taskbountyplatform.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CampusEnum {
    LIANGXIANG("良乡校区"),
    ZHONGGUANCUN("中关村校区"),
    BOTH("两校区往返");

    private final String displayName;
    CampusEnum(String displayName) { this.displayName = displayName; }

    @JsonValue
    public String getDisplayName() { return displayName; }

    @JsonCreator
    public static CampusEnum fromName(String name) {
        for (CampusEnum e : values()) {
            if (e.displayName.equals(name) || e.name().equalsIgnoreCase(name)) return e;
        }
        throw new IllegalArgumentException("无效的校区: " + name);
    }
}
