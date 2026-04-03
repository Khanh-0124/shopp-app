package com.project.shopapp.filters;

import com.project.shopapp.components.JwtTokenUtils;
import com.project.shopapp.models.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter{
    @Value("${api.prefix}")
    private String apiPrefix;
    private final UserDetailsService userDetailsService;
    private final JwtTokenUtils jwtTokenUtil;
    @Override
    protected void doFilterInternal(@NonNull  HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
                filterChain.doFilter(request, response);
                return;
            }
            if(isBypassToken(request)) {
                filterChain.doFilter(request, response); //enable bypass
                return;
            }
            final String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                return;
            }
            final String token = authHeader.substring(7);
            final String phoneNumber = jwtTokenUtil.extractPhoneNumber(token);
            if (phoneNumber != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                User userDetails = (User) userDetailsService.loadUserByUsername(phoneNumber);
                if(jwtTokenUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                     userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
            filterChain.doFilter(request, response); //enable bypass
        }catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        }

    }
    private boolean isBypassToken(@NonNull HttpServletRequest request) {
        final List<java.util.AbstractMap.SimpleEntry<String, String>> bypassTokens = Arrays.asList(
                new java.util.AbstractMap.SimpleEntry<>(String.format("/%s/products", apiPrefix), "GET"),
                new java.util.AbstractMap.SimpleEntry<>(String.format("/%s/categories", apiPrefix), "GET"),
                new java.util.AbstractMap.SimpleEntry<>(String.format("/%s/banners", apiPrefix), "GET"),
                new java.util.AbstractMap.SimpleEntry<>(String.format("/%s/roles", apiPrefix), "GET"),
                new java.util.AbstractMap.SimpleEntry<>(String.format("/%s/users/login", apiPrefix), "POST"),
                new java.util.AbstractMap.SimpleEntry<>(String.format("/%s/users/register", apiPrefix), "POST")
        );

        String requestPath = request.getServletPath();
        String method = request.getMethod();

        if (requestPath.contains("/images")) {
            return true;
        }

        for (java.util.AbstractMap.SimpleEntry<String, String> token : bypassTokens) {
            if (requestPath.contains(token.getKey()) && method.equalsIgnoreCase(token.getValue())) {
                return true;
            }
        }
        return false;
    }
}
