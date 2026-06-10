package com.firstteam.taskbountyplatform.admin.controller;

import com.firstteam.taskbountyplatform.auth.security.JwtUtils;
import com.firstteam.taskbountyplatform.common.enums.AccountRole;
import com.firstteam.taskbountyplatform.common.enums.UserStatus;
import com.firstteam.taskbountyplatform.common.exception.BusinessException;
import com.firstteam.taskbountyplatform.common.response.ApiResponse;
import com.firstteam.taskbountyplatform.user.entity.User;
import com.firstteam.taskbountyplatform.user.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AdminAuthController(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody AdminLoginRequest request) {
        User admin = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("账号或密码错误"));

        if (admin.getRole() != AccountRole.ADMIN) {
            throw new BusinessException("非管理员账号");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new BusinessException("账号或密码错误");
        }

        if (admin.getAccountStatus() == UserStatus.FROZEN) {
            throw new BusinessException("账号已被冻结");
        }

        String token = jwtUtils.generateToken(admin.getId(), admin.getUsername(), "ADMIN");

        Map<String, Object> adminInfo = new HashMap<>();
        adminInfo.put("id", admin.getId());
        adminInfo.put("username", admin.getUsername());
        adminInfo.put("role", "admin");

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("admin", adminInfo);

        return ApiResponse.success("登录成功", result);
    }

    static class AdminLoginRequest {
        @NotBlank(message = "用户名不能为空")
        private String username;
        @NotBlank(message = "密码不能为空")
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String v) { this.username = v; }
        public String getPassword() { return password; }
        public void setPassword(String v) { this.password = v; }
    }
}
