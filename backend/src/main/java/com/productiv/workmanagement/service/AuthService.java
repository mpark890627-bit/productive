package com.productiv.workmanagement.service;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.common.security.JwtUtil;
import com.productiv.workmanagement.common.security.SecurityUtils;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.entity.enums.UserRole;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.UnauthorizedException;
import com.productiv.workmanagement.web.dto.auth.AuthResponse;
import com.productiv.workmanagement.web.dto.auth.LoginRequest;
import com.productiv.workmanagement.web.dto.auth.MeResponse;
import com.productiv.workmanagement.web.dto.auth.RegisterRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use.");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        user.setRole(UserRole.USER);

        User saved = userRepository.save(user);
        return toAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials.");
        }

        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public MeResponse me() {
        CustomUserPrincipal principal = SecurityUtils.getCurrentUserOrThrow();
        return new MeResponse(
            principal.getUserId(),
            principal.getUsername(),
            principal.getName(),
            principal.getRole()
        );
    }

    private AuthResponse toAuthResponse(User user) {
        CustomUserPrincipal principal = new CustomUserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getName(),
            user.getRole().name()
        );

        return new AuthResponse(
            jwtUtil.generateAccessToken(principal),
            "Bearer",
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name()
        );
    }
}
