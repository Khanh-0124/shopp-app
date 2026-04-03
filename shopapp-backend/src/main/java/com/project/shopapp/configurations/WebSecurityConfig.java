package com.project.shopapp.configurations;

import com.project.shopapp.filters.JwtTokenFilter;
import com.project.shopapp.models.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


import java.util.Arrays;
import java.util.List;

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
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(requests -> {
                    requests
                            .requestMatchers(GET, "/api/v1/products/images/**").permitAll()
                            .requestMatchers(GET, "/api/v1/banners/**").permitAll()
                            .requestMatchers(GET, "/api/v1/categories/**").permitAll()
                            .requestMatchers(GET, "/api/v1/products/**").permitAll()
                            .requestMatchers(GET, "/api/v1/roles/**").permitAll()

                            .requestMatchers(POST, String.format("/%s/users/register", apiPrefix)).permitAll()
                            .requestMatchers(POST, String.format("/%s/users/login", apiPrefix)).permitAll()
                            
                            .requestMatchers(POST, String.format("/%s/categories/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(PUT, String.format("/%s/categories/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(DELETE, String.format("/%s/categories/**", apiPrefix)).hasAnyRole(Role.ADMIN)

                            .requestMatchers(POST, String.format("/%s/products**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(PUT, String.format("/%s/products/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(DELETE, String.format("/%s/products/**", apiPrefix)).hasAnyRole(Role.ADMIN)

                            .requestMatchers(POST, String.format("/%s/orders/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(GET, String.format("/%s/orders/**", apiPrefix)).permitAll()
                            .requestMatchers(PUT, String.format("/%s/orders/**", apiPrefix)).hasRole(Role.ADMIN)
                            .requestMatchers(DELETE, String.format("/%s/orders/**", apiPrefix)).hasRole(Role.ADMIN)

                            .requestMatchers(POST, String.format("/%s/order_details/**", apiPrefix)).hasAnyRole(Role.USER)
                            .requestMatchers(GET, String.format("/%s/order_details/**", apiPrefix)).permitAll()
                            
                            .requestMatchers(POST, String.format("/%s/banners/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(PUT, String.format("/%s/banners/**", apiPrefix)).hasAnyRole(Role.ADMIN)
                            .requestMatchers(DELETE, String.format("/%s/banners/**", apiPrefix)).hasAnyRole(Role.ADMIN)

                            .requestMatchers(PUT, String.format("/%s/order_details/**", apiPrefix)).hasRole(Role.ADMIN)
                            .requestMatchers(DELETE, String.format("/%s/order_details/**", apiPrefix)).hasRole(Role.ADMIN)

                            .anyRequest().authenticated();
                })
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token", "origin", "accept"));
        configuration.setExposedHeaders(List.of("x-auth-token"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
