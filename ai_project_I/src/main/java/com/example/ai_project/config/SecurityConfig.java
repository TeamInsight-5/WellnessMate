package com.example.ai_project.config;

import com.example.ai_project.main.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/", "/main", "/css/**", "/js/**", "/img/**", "/signupMain", "/signup","/find","/findPass").permitAll() // 공개 접근 허용
                        .requestMatchers("/api/email/**").permitAll()
                        .requestMatchers("/memberManager/profile/**").authenticated()
                        .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                )
                .formLogin(form -> form
                        .loginPage("/loginMain") // 로그인 페이지 URL
                        .loginProcessingUrl("/login") // 로그인 처리 URL
                        .defaultSuccessUrl("/main", true) // 성공 시 리다이렉션 URL
                        .failureUrl("/loginMain?error=true") // 실패 시 리다이렉션 URL
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/main") // 로그아웃 성공 시 리다이렉션 URL
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                .csrf(csrf -> csrf.disable()); // 예제에서는 편의상 CSRF 비활성화

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}