package com.project.shopapp.configurations;

import com.project.shopapp.filters.JwtTokenFilter;
import com.project.shopapp.models.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtTokenFilter jwtTokenFilter;
    
    @Value("${api.prefix}")
    private String apiPrefix;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(requests -> {
                    requests
                            .requestMatchers(GET, "/api/v1/products/**").permitAll()
                            .requestMatchers(GET, "/api/v1/categories/**").permitAll()
                            .requestMatchers(GET, "/api/v1/banners/**").permitAll()
                            .requestMatchers(GET, "/api/v1/roles/**").permitAll()
                            .requestMatchers(GET, "/api/v1/products/images/**").permitAll()

                            .requestMatchers(POST, String.format("/%s/users/register", apiPrefix)).permitAll()
                            .requestMatchers(POST, String.format("/%s/users/login", apiPrefix)).permitAll()
                            
                            .requestMatchers(POST, String.format("/%s/categories/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(PUT, String.format("/%s/categories/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(DELETE, String.format("/%s/categories/**", apiPrefix)).hasAnyRole(Role.ADMIN)

                            .requestMatchers(POST, String.format("/%s/products**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(PUT, String.format("/%s/products/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(DELETE, String.format("/%s/products/**", apiPrefix)).hasAnyRole(Role.ADMIN)

                            .requestMatchers(POST, String.format("/%s/orders/**", apiPrefix)).permitAll()
                            .requestMatchers(GET, String.format("/%s/orders/**", apiPrefix)).permitAll()
                            .anyRequest().authenticated();
                });

        return http.build();
    }
}
