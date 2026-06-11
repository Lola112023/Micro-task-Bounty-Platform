package com.firstteam.taskbountyplatform.auth.service;

import com.firstteam.taskbountyplatform.auth.dto.LoginRequest;
import com.firstteam.taskbountyplatform.auth.dto.LoginResponse;
import com.firstteam.taskbountyplatform.auth.dto.RegisterRequest;
import com.firstteam.taskbountyplatform.auth.dto.UserInfoDTO;
import com.firstteam.taskbountyplatform.auth.security.JwtUtils;
import com.firstteam.taskbountyplatform.auth.security.UserContext;
import com.firstteam.taskbountyplatform.common.enums.AccountRole;
import com.firstteam.taskbountyplatform.common.enums.UserStatus;
import com.firstteam.taskbountyplatform.common.exception.BusinessException;
import com.firstteam.taskbountyplatform.config.PlatformConfig;
import com.firstteam.taskbountyplatform.point.entity.PointAccount;
import com.firstteam.taskbountyplatform.point.repository.PointAccountRepository;
import com.firstteam.taskbountyplatform.user.entity.User;
import com.firstteam.taskbountyplatform.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PointAccountRepository pointAccountRepository;
    private final JwtUtils jwtUtils;
    private final UserContext userContext;
    private final PlatformConfig platformConfig;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PointAccountRepository pointAccountRepository,
                       JwtUtils jwtUtils, UserContext userContext, PlatformConfig platformConfig,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.pointAccountRepository = pointAccountRepository;
        this.jwtUtils = jwtUtils;
        this.userContext = userContext;
        this.platformConfig = platformConfig;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getAccountStatus() == UserStatus.FROZEN) {
            if (user.getFrozenUntil() != null && user.getFrozenUntil().isAfter(LocalDateTime.now())) {
                throw new BusinessException("账户已被冻结，解冻时间：" + user.getFrozenUntil());
            }
            user.setAccountStatus(UserStatus.NORMAL);
            user.setFrozenUntil(null);
            user.setFreezeReason(null);
        }

        user.setLastLoginTime(LocalDateTime.now());
        userRepository.save(user);

        PointAccount pointAccount = pointAccountRepository.findByUserId(user.getId())
                .orElse(new PointAccount(user.getId(), 0, 0, 0, 0, null));

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        UserInfoDTO userInfo = toUserInfoDTO(user);
        userInfo.setAvailablePoints(pointAccount.getAvailablePoints());
        userInfo.setFrozenPoints(pointAccount.getFrozenPoints());
        userInfo.setTotalIncome(pointAccount.getTotalIncome());
        userInfo.setTotalExpense(pointAccount.getTotalExpense());
        response.setUser(userInfo);
        return response;
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("两次密码输入不一致");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("该用户名已被注册");
        }

        if (request.getStudentNo() != null && !request.getStudentNo().isBlank()
                && userRepository.existsByStudentNo(request.getStudentNo())) {
            throw new BusinessException("该学号/工号已被注册，请勿重复注册");
        }

        if (userRepository.existsByNickname(request.getNickname())) {
            throw new BusinessException("该昵称已被使用");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStudentNo(request.getStudentNo() != null && !request.getStudentNo().isBlank()
                ? request.getStudentNo() : request.getUsername());
        user.setNickname(request.getNickname());
        user.setRealName(request.getRealName() != null && !request.getRealName().isBlank()
                ? request.getRealName() : request.getNickname());
        user.setAvatarUrl("/avatars/default.png");
        user.setCreditScore(platformConfig.getCredit().getInitialScore());
        user.setAccountStatus(UserStatus.NORMAL);
        user.setRole(AccountRole.USER);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginTime(LocalDateTime.now());
        user = userRepository.save(user);

        PointAccount account = new PointAccount();
        account.setUserId(user.getId());
        account.setAvailablePoints(platformConfig.getInitialPoints());
        account.setFrozenPoints(0);
        account.setTotalIncome(0);
        account.setTotalExpense(0);
        pointAccountRepository.save(account);

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        UserInfoDTO userInfo = toUserInfoDTO(user);
        PointAccount saved = pointAccountRepository.findByUserId(user.getId())
                .orElse(new PointAccount(user.getId(), 0, 0, 0, 0, null));
        userInfo.setAvailablePoints(saved.getAvailablePoints());
        userInfo.setFrozenPoints(saved.getFrozenPoints());
        userInfo.setTotalIncome(saved.getTotalIncome());
        userInfo.setTotalExpense(saved.getTotalExpense());
        response.setUser(userInfo);
        return response;
    }

    public UserInfoDTO getCurrentUser() {
        Long userId = userContext.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        PointAccount account = pointAccountRepository.findByUserId(userId)
                .orElse(new PointAccount());
        UserInfoDTO dto = toUserInfoDTO(user);
        dto.setAvailablePoints(account.getAvailablePoints());
        dto.setFrozenPoints(account.getFrozenPoints());
        dto.setTotalIncome(account.getTotalIncome());
        dto.setTotalExpense(account.getTotalExpense());
        return dto;
    }

    private UserInfoDTO toUserInfoDTO(User user) {
        UserInfoDTO dto = new UserInfoDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setStudentNo(user.getStudentNo());
        dto.setRealName(user.getRealName());
        dto.setNickname(user.getNickname());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setAnnouncement(user.getAnnouncement() != null ? user.getAnnouncement() : "");
        dto.setGrade(user.getGrade() != null ? user.getGrade() : "");
        dto.setCollege(user.getCollege() != null ? user.getCollege() : "");
        dto.setAcademy(user.getAcademy() != null ? user.getAcademy() : "");
        dto.setCreditScore(user.getCreditScore());
        dto.setAccountStatus(user.getAccountStatus().name());
        dto.setRole(user.getRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
